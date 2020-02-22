import { act, renderHook } from "@testing-library/react-hooks";
import React from "react";
import { createEventDefinition } from "./EventBus";
import { BusProvider, stateSubscriber, useBus, useBusState } from "./react";
import { bus, mockEventBus, wrapper } from "./testhelpers";

it("should provide a bus", () => {
  const { result } = renderHook(() => useBus(), { wrapper });
  expect(result.current).toBe(bus);
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

it("should update state (options configuration)", () => {
  const incrementEvent = createEventDefinition<number>()("counter.increment");

  const { result } = renderHook(
    () =>
      useBusState.configure({
        subscriber: (dispatch, bus) => {
          return bus.subscribe("counter.**", v => dispatch(v.payload));
        }
      })(0),
    {
      wrapper
    }
  );

  expect(result.current).toBe(0);

  act(() => {
    bus.publish(incrementEvent(1));
  });

  expect(result.current).toBe(1);
});

it("should update state by subscribing to multiple events", () => {
  const positiveNumberEvent = createEventDefinition<number>()("positive");
  const negativeNumberEvent = createEventDefinition<number>()("negative");

  const { result } = renderHook(
    () =>
      useBusState.configure({
        subscriber: stateSubscriber("positive", "negative")
      })(0),
    {
      wrapper
    }
  );

  expect(result.current).toBe(0);

  act(() => bus.publish(positiveNumberEvent(15)));
  expect(result.current).toBe(15);

  act(() => bus.publish(negativeNumberEvent(-5)));
  expect(result.current).toBe(-5);
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
