import { useLayoutEffect, useState, useCallback } from "react";
import { EventBus } from "./EventBus";
import { useBus } from "./react";
import {
  BusEvent,
  DispatchFn,
  EventCreatorFn,
  SubscribeWithPayloadDispatchFn,
  SubscriptionDef,
  UnsubscribeFn
} from "./types";

export const stateSubscriber = <E extends BusEvent>(
  ...definition: SubscriptionDef<E>[]
): SubscribeWithPayloadDispatchFn<E> => {
  return (dispatch: DispatchFn<E["payload"]>, bus: EventBus): UnsubscribeFn => {
    return bus.subscribe(definition, (ev: any) => dispatch(ev.payload));
  };
};

type UseStateReturnTuple<E extends BusEvent> = [
  E["payload"],
  (a: E["payload"]) => void
];

const useStateCreator = <E extends BusEvent = BusEvent>(
  dispatchEventCreator: EventCreatorFn<E>,
  subscriber: SubscribeWithPayloadDispatchFn<E>
) => (initState: E["payload"] | (() => E["payload"])) => {
  const bus = useBus();

  const [state, dispatch] = useState<E["payload"]>(initState);

  useLayoutEffect(() => subscriber(dispatch, bus), [dispatch, bus]);

  const dispatchFn = useCallback(
    (value: E["payload"]) => {
      bus.publish(dispatchEventCreator(value));
    },
    [bus]
  );

  return [state, dispatchFn] as UseStateReturnTuple<E>;
};

export function useBusState<E extends BusEvent = BusEvent>(
  initState: E["payload"] | undefined,
  event: EventCreatorFn<E>
) {
  const useState = useStateCreator(event, (dispatch, bus) => {
    return bus.subscribe(event, (ev: E) => dispatch(ev.payload));
  });
  return useState(initState);
}

type UseBusStateOptions<E extends BusEvent> = {
  subscriber: SubscribeWithPayloadDispatchFn<E>;
};

useBusState.configure = <E extends BusEvent = BusEvent>(
  event: EventCreatorFn<E>,
  options: UseBusStateOptions<E>
) => {
  return useStateCreator(event, options.subscriber);
};
