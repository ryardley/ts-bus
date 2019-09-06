import React from "react";
import { create } from "react-test-renderer";

import { renderHook, act } from "@testing-library/react-hooks";
import { BusProvider, useBus, useBusReducer } from "./react";
import { _defaultSubscriber } from "./useBusReducer";
import { EventBus } from "./EventBus";
import { EventEmitter2 } from "eventemitter2";

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

it("should not subscribe without unsubscribing ", () => {
  const mockBus = mockEventBus();

  // run once to subscribe to bus
  const hook = renderHook(
    (subscriberFn: (d: any, b: any) => void) =>
      useBusReducer({}, (state: {}) => state, subscriberFn),
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

it("should reduce state", () => {
  const { result } = renderHook(
    () =>
      useBusReducer(
        { counter: 0 },
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
        }
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
    () =>
      useBusReducer(
        { counter: 0 },
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
        (dispatch, bus) => {
          bus.subscribe("count.**", dispatch);
        }
      ),
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
    useBusReducer({}, reducer);

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
