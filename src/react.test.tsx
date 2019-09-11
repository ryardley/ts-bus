import React from "react";
import { create } from "react-test-renderer";

import { renderHook, act } from "@testing-library/react-hooks";
import { BusProvider, useBus, useBusReducer, useBusState } from "./react";
import { _defaultSubscriber } from "./useBusReducer";
import { EventBus, createEventDefinition } from "./EventBus";
import { EventEmitter2 } from "eventemitter2";
import { SubscribeFn } from "./types";
const bus = new EventBus();

function mockEventBus() {
  const _unsubscribe = jest.fn();
  const subscribe = jest.fn(() => _unsubscribe);
  const publish = jest.fn();
  const emitter = new EventEmitter2();
  return { subscribe, emitter, publish, _unsubscribe };
}

const wrapper = ({ children }: { children?: React.ReactNode }) => (
  <BusProvider value={bus}>{children}</BusProvider>
);

it("should provide a bus", () => {
  const { result } = renderHook(() => useBus(), { wrapper });
  expect(result.current).toBe(bus);
});

it("should not subscribe without unsubscribing (useBusReducer)", () => {
  const mockBus = mockEventBus();
  // run once to subscribe to bus
  // type SubscribeFn = (d: any, b: any) => void;
  const hook = renderHook(
    (subscriberFn: SubscribeFn<any>) => {
      const useReducer = useBusReducer.configure({ subscriber: subscriberFn });
      return useReducer((state: {}) => state, {}, (a: any) => a);
    },
    {
      wrapper: ({ children }: { children?: React.ReactNode }) => (
        <BusProvider value={mockBus}>{children}</BusProvider>
      ),
      initialProps: _defaultSubscriber
    }
  );

  // change subscriber to different reference to invalidate useEffect
  hook.rerender((...args) => _defaultSubscriber(...args));
  hook.unmount();

  expect(mockBus.subscribe.mock.calls.length).toBe(2);
  expect(mockBus._unsubscribe.mock.calls.length).toBe(2);
});

it("should not subscribe without unsubscribing (useBusState)", () => {
  const mockBus = mockEventBus();
  const incrementEvent = createEventDefinition<number>()("increment");

  // run once to subscribe to bus
  const hook = renderHook(() => useBusState(0, incrementEvent), {
    wrapper: ({ children }: { children?: React.ReactNode }) => (
      <BusProvider value={mockBus}>{children}</BusProvider>
    )
  });

  hook.unmount();

  expect(mockBus.subscribe.mock.calls.length).toBe(1);
  expect(mockBus._unsubscribe.mock.calls.length).toBe(1);
});

it("should update state", () => {
  const incrementEvent = createEventDefinition<number>()("increment");

  const { result } = renderHook(() => useBusState(0, incrementEvent), {
    wrapper
  });

  expect(result.current).toBe(0);

  act(() => {
    bus.publish(incrementEvent(1));
  });

  expect(result.current).toBe(1);
});

it("should reduce state", () => {
  const { result } = renderHook(
    () =>
      useBusReducer(
        (
          state: { counter: number },
          event: { type: string; payload: number }
        ) => {
          switch (event.type) {
            case "increment": {
              return {
                ...state,
                counter: state.counter + 1
              };
            }
            case "decrement": {
              return {
                ...state,
                counter: state.counter - 1
              };
            }
          }
          return state;
        },
        { counter: 0 },
        (a: any) => a
      ),
    { wrapper }
  );

  expect(result.current.counter).toBe(0);

  act(() => {
    bus.publish({ type: "increment", payload: null });
    bus.publish({ type: "increment", payload: null });
    bus.publish({ type: "increment", payload: null });
  });
  expect(result.current.counter).toBe(3);
});

it("should subscribe state", () => {
  const { result } = renderHook(
    () => {
      const useReducer = useBusReducer.configure({
        subscriber: (dispatch, bus) => {
          return bus.subscribe("count.**", dispatch);
        }
      });
      return useReducer(
        (
          state: { counter: number },
          event: { type: string; payload: number }
        ) => {
          switch (event.type) {
            case "count.increment": {
              return {
                ...state,
                counter: state.counter + 1
              };
            }
            case "count.decrement": {
              return {
                ...state,
                counter: state.counter - 1
              };
            }
            case "reset": {
              return {
                ...state,
                counter: 0
              };
            }
          }
          return state;
        },
        { counter: 0 }
      );
    },
    { wrapper }
  );

  expect(result.current.counter).toBe(0);

  act(() => {
    bus.publish({ type: "count.increment", payload: null });
    bus.publish({ type: "reset", payload: null });
  });

  // Reset should have no effect because of subscriber
  expect(result.current.counter).toBe(1);
});

it("should not loose events during the render cycle when mounted.", done => {
  const myBus = new EventBus();
  const reducer = jest.fn(s => s);

  const EVENT_DELAY = { type: "myevent", payload: "DELAY" };
  const EVENT_URGENT = { type: "myevent", payload: "URGENT" };

  function MyContextProvider(props: { children: any }) {
    useBusReducer(reducer, {});

    return props.children;
  }

  function EventPublisher() {
    const b = useBus();

    React.useEffect(() => {
      setTimeout(() => {
        b.publish(EVENT_DELAY);
      }, 0);
    }, [b]);

    React.useEffect(() => {
      b.publish(EVENT_URGENT);
    }, [b]);

    return <div />;
  }

  function App() {
    return (
      <BusProvider value={myBus}>
        <MyContextProvider>
          <EventPublisher />
        </MyContextProvider>
      </BusProvider>
    );
  }

  // render the component
  act(() => {
    create(<App />);
  });

  setTimeout(() => {
    const eventList = reducer.mock.calls.map(([, ev]: any[]) => ev);
    expect(eventList).toEqual([EVENT_URGENT, EVENT_DELAY]);
    done();
  }, 0);
});
