import { act, renderHook } from "@testing-library/react-hooks";
import React from "react";
import { createEventDefinition } from "./EventBus";
import { BusProvider, stateSubscriber, useBus, useBusState } from "./react";
import { bus, mockEventBus, wrapper } from "./testhelpers";

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
      useBusState.configure(incrementEvent, {
        subscriber: (dispatch, bus) => {
          return bus.subscribe("counter.**", v => dispatch(v.payload));
        }
      })(0),
    {
      wrapper
    }
  );

  expect(result.current[0]).toBe(0);

  act(() => {
    bus.publish(incrementEvent(1));
  });

  expect(result.current[0]).toBe(1);

  act(() => {
    result.current[1](20); // set value to 20
  });

  expect(result.current[0]).toBe(20);
});

it("should update state by subscribing to multiple events", () => {
  const positiveNumberEvent = createEventDefinition<number>()("positive");
  const negativeNumberEvent = createEventDefinition<number>()("negative");

  // We need an event that will be fired
  // when we use the 'dispatch' function
  // returned form the useState() fn
  const posNeg = createEventDefinition<number>()("posNeg");

  const { result } = renderHook(
    () =>
      useBusState.configure(posNeg, {
        subscriber: stateSubscriber("positive", "negative")
      })(0),
    {
      wrapper
    }
  );

  expect(result.current[0]).toBe(0);

  act(() => bus.publish(positiveNumberEvent(15)));
  expect(result.current[0]).toBe(15);

  act(() => bus.publish(negativeNumberEvent(-5)));
  expect(result.current[0]).toBe(-5);
});

it("should update state", () => {
  const incrementEvent = createEventDefinition<number>()("increment");

  const { result } = renderHook(() => useBusState(0, incrementEvent), {
    wrapper
  });

  expect(result.current[0]).toBe(0);

  act(() => {
    bus.publish(incrementEvent(1));
  });

  expect(result.current[0]).toBe(1);
});

describe("when the dispatchEvent is not the same as the subscribe event", () => {
  it("should set the dispatch event only and be able to subscribe to other events", () => {
    const one = createEventDefinition<number>()("one");
    const two = createEventDefinition<number>()("two");
    const three = createEventDefinition<number>()("three");

    const { result } = renderHook(
      () =>
        useBusState.configure(three, {
          subscriber: stateSubscriber("one", "two")
        })(0),
      {
        wrapper
      }
    );

    expect(result.current[0]).toBe(0);

    act(() => {
      bus.publish(one(1));
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      bus.publish(two(2));
    });

    expect(result.current[0]).toBe(2);

    act(() => {
      result.current[1](3);
    });

    // Remains 2 because subscription does not include "three" event
    expect(result.current[0]).toBe(2);
  });
});
