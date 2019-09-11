import { useReducer, useLayoutEffect } from "react";
import { useBus } from "./react";
import { EventBus } from "./EventBus";
import { DispatchFn, SubscribeFn, BusEvent } from "./types";

type InitFn<T> = (a: any) => T;
type ReducerFn<S, E> = (s: S, e: E) => S;

function indentity<T>(a: T) {
  return a;
}

export function _defaultSubscriber<E extends BusEvent>(
  dispatch: DispatchFn<E>,
  bus: EventBus
) {
  return bus.subscribe<E>("**", dispatch);
}

const useReducerCreator = <E extends BusEvent = BusEvent, T = any>(
  subscriber: SubscribeFn<E>
) => (
  reducer: ReducerFn<T, E>,
  initState: any,
  init: InitFn<T> = indentity
) => {
  // Pull the bus from context
  const bus = useBus();

  // Run the reducer
  const [state, dispatch] = useReducer(reducer, initState, init);

  // Run the subscriber synchronously
  useLayoutEffect(() => subscriber(dispatch, bus), [subscriber, dispatch, bus]);

  return state;
};

export function useBusReducer<E extends BusEvent = BusEvent, T = any>(
  reducer: ReducerFn<T, E>,
  initState: any,
  init: InitFn<T> = indentity
) {
  const useReducerFn = useReducerCreator(_defaultSubscriber);

  return useReducerFn(reducer, initState, init);
}

type UseBusReducerOptions<E extends BusEvent> = {
  subscriber: SubscribeFn<E>;
};

useBusReducer.configure = <E extends BusEvent = BusEvent>(
  options: UseBusReducerOptions<E>
) => {
  return useReducerCreator(options.subscriber);
};
