import React from "react";
import { EventBus } from "./EventBus";
import { useBus } from "./react";
import {
  BusEvent,
  DispatchFn,
  SubscribeFn,
  SubscriptionDef,
  UnsubscribeFn
} from "./types";

export type InitFn<T> = (a: any) => T;
export type ReducerFn<S, E> = (s: S, e: E) => S;
export type UseReducerFn<T, E> = (
  reducer: ReducerFn<T, E>,
  initState: any,
  init: InitFn<T>
) => [T, any];
function indentity<T>(a: T) {
  return a;
}

export function _defaultSubscriber<E extends BusEvent>(
  dispatch: DispatchFn<E>,
  bus: EventBus
): UnsubscribeFn {
  return bus.subscribe<E>("**", dispatch);
}

export const reducerSubscriber = <E extends BusEvent>(
  ...definition: SubscriptionDef<E>[]
): SubscribeFn<E> => {
  return (dispatch: DispatchFn<any>, bus: EventBus): UnsubscribeFn => {
    return bus.subscribe(definition, dispatch);
  };
};

const useReducerCreator = <E extends BusEvent = BusEvent, T = any>(
  subscriber: SubscribeFn<E> = _defaultSubscriber,
  useReducer: UseReducerFn<any, E> = React.useReducer
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
  React.useLayoutEffect(() => subscriber(dispatch, bus), [
    subscriber,
    dispatch,
    bus
  ]);

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

type UseBusReducerOptions<E extends BusEvent, T = any> = {
  subscriber?: SubscribeFn<E>;
  useReducer?: (reducer: ReducerFn<T, E>, initState: T, init: InitFn<T>) => any;
};

useBusReducer.configure = <E extends BusEvent = BusEvent>(
  options: UseBusReducerOptions<E>
) => {
  return useReducerCreator(options.subscriber, options.useReducer);
};
