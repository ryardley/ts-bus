import { useReducer, useEffect } from "react";
import { useBus } from "./react";
import { EventBus } from "./EventBus";
import { BusEvent } from "./types";

type DispatchFn<E> = (a: E) => void;

export function _defaultSubscriber<E extends BusEvent>(
  dispatch: DispatchFn<E>,
  bus: EventBus
) {
  return bus.subscribe<E>("**", dispatch);
}

export function useBusReducer<E extends BusEvent = BusEvent, T = any>(
  initState: T,
  reducer: (s: T, a: E) => T,
  subscriber: (
    dispatch: DispatchFn<E>,
    bus: EventBus
  ) => void = _defaultSubscriber
) {
  // Pull the bus from context
  const bus = useBus();

  // Run the reducer
  const [state, dispatch] = useReducer(reducer, initState);

  // Run the subscriber
  useEffect(() => subscriber(dispatch, bus), [subscriber, dispatch, bus]);

  return state;
}
