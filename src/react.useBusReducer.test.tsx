import { act, renderHook } from "@testing-library/react-hooks";

import React from "react";

import { BusProvider, useBusReducer, reducerSubscriber } from "./react";
import { SubscribeFn, BusEvent } from "./types";
import { _defaultSubscriber } from "./useBusReducer";
import { mockEventBus, bus, wrapper } from "./testhelpers";
import { createEventDefinition, EventBus } from "./EventBus";
import { create } from "react-test-renderer";
import { useBus } from "./BusContext";

it("should not subscribe without unsubscribing (useBusReducer)", () => {
  const mockBus = mockEventBus();
  // run once to subscribe to bus
  // type SubscribeFn = (d: any, b: any) => void;
  const hook = renderHook(
    (subscriberFn: SubscribeFn<any>) => {
      const useReducer = useBusReducer.configure({ subscriber: subscriberFn });
      return useReducer(
        (state: {}) => state,
        {},
        (a: any) => a
      );
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

it("should not reduce for not subscribed event", () => {
  const { result } = renderHook(
    () => {
      const reducer = useBusReducer.configure({
        subscriber: reducerSubscriber("increment", "decrement")
      });
      return reducer(
        (
          state: { counter: number },
          event: { type: string; payload: number }
        ) => {
          switch (event.type) {
            case "increment":
              return {
                ...state,
                counter: state.counter + 1
              };
            case "decrement":
              return {
                ...state,
                counter: state.counter - 1
              };
            case "multiply": // Must never be called
              return {
                ...state,
                counter: state.counter * 100
              };
          }
          return state;
        },
        { counter: 0 },
        (a: any) => a
      );
    },
    { wrapper }
  );

  expect(result.current[0].counter).toBe(0);

  act(() => {
    bus.publish({ type: "increment", payload: null });
    bus.publish({ type: "multiply", payload: null });
    bus.publish({ type: "increment", payload: null });
    bus.publish({ type: "decrement", payload: null });
  });

  expect(result.current[0].counter).toBe(1);
});

it("should reduce using multiple event subscription types", () => {
  const minusFour = createEventDefinition()("minusFour");

  const { result } = renderHook(
    () => {
      const reducer = useBusReducer.configure({
        subscriber: reducerSubscriber(
          "increment",
          "decrement",
          minusFour,
          (x: BusEvent) => x.payload !== null && x.payload >= 3
        )
      });
      return reducer(
        (
          state: { counter: number },
          event: { type: string; payload: number }
        ) => {
          switch (event.type) {
            case "increment":
              return {
                ...state,
                counter: state.counter + 1
              };
            case "decrement":
              return {
                ...state,
                counter: state.counter - 1
              };
            case "minusFour":
              return {
                ...state,
                counter: state.counter - 4
              };
            case "multiply":
              return {
                ...state,
                counter: state.counter * event.payload
              };
          }
          return state;
        },
        { counter: 0 },
        (a: any) => a
      );
    },
    { wrapper }
  );

  expect(result.current[0].counter).toBe(0);

  act(() => {
    bus.publish({ type: "increment", payload: null }); // Reaches reducer
    bus.publish({ type: "increment", payload: null }); // Reaches reducer
    bus.publish({ type: "decrement", payload: null }); // Reaches reducer
    bus.publish({ type: "increment", payload: null }); // Reaches reducer
    bus.publish({ type: "multiply", payload: 2 }); // Does not reach reducer
    bus.publish({ type: "multiply", payload: 3 }); // Reaches reducer
    bus.publish({ type: "multiply", payload: 4 }); // Reaches reducer
    bus.publish({ type: "multiply", payload: 2 }); // Reaches reducer
    bus.publish(minusFour()); // Reaches reducer
  });

  expect(result.current[0].counter).toBe(20);
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

  expect(result.current[0].counter).toBe(0);

  act(() => {
    bus.publish({ type: "increment", payload: null });
    bus.publish({ type: "increment", payload: null });
    bus.publish({ type: "increment", payload: null });
  });
  expect(result.current[0].counter).toBe(3);
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

  expect(result.current[0].counter).toBe(0);

  act(() => {
    bus.publish({ type: "count.increment", payload: null });
    bus.publish({ type: "reset", payload: null });
  });

  // Reset should have no effect because of subscriber
  expect(result.current[0].counter).toBe(1);
});

it("should return a dispatch function that aliases bus.publish()", () => {
  const { result } = renderHook(
    () => {
      return useBusReducer(
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

  expect(result.current[0].counter).toBe(0);

  act(() => {
    const dispatch = result.current[1];
    dispatch({ type: "count.increment", payload: null });
  });

  expect(result.current[0].counter).toBe(1);
});

it("should use an alternate useReducer", () => {
  const mockUseReducer = jest.fn(
    (reducer: any, initialState: any, initializer: any) => {
      return React.useReducer(reducer, initialState, initializer);
    }
  );

  const reducer = (state: { counter: number }) => {
    return state;
  };
  const init = { counter: 0 };
  const ident = (a: any) => a;
  renderHook(
    () => {
      const useReducer = useBusReducer.configure({
        useReducer: mockUseReducer
      });
      return useReducer(reducer, init, ident);
    },
    { wrapper }
  );

  expect(mockUseReducer).toBeCalledWith(reducer, init, ident);
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
