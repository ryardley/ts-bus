import React from "react";

import { renderHook, act } from "@testing-library/react-hooks";
import { BusProvider, useBus, useBusReducer, useBusState } from "./react";
import { _defaultSubscriber } from "./useBusReducer";
import { EventBus, createEventDefinition } from "./EventBus";
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

it("should not subscribe without unsubscribing (useBusReducer) ", () => {
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

it("should not subscribe without unsubscribing (useBusState)", () => {
  const mockBus = mockEventBus();
  const incrementEvent = createEventDefinition<{counter: number}>()("increment");

  // run once to subscribe to bus
  const hook = renderHook(() =>
    useBusState<ReturnType<typeof incrementEvent>>(
      {counter: 0},
      incrementEvent.eventType),
    {
      wrapper: ({ children }: { children?: React.ReactNode }) => (
        <BusProvider value={mockBus}>{children}</BusProvider>
      )
    }
  );

  hook.unmount();

  expect(mockBus.subscribe.mock.calls.length).toBe(1);
  expect(mockBus._unsubscribe.mock.calls.length).toBe(1);
});

it("should update state", () => {
  const incrementEvent = createEventDefinition<{counter: number}>()("increment");
  
  const { result } = renderHook(
    () =>
      useBusState<ReturnType<typeof incrementEvent>>(
        {counter: 0}, incrementEvent.eventType),
    { wrapper }
  );

  expect(result.current.counter).toBe(0);

  act(() => {
    bus.publish({ type: incrementEvent.eventType, payload: {counter: 1} });
  });

  expect(result.current.counter).toBe(1);
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
