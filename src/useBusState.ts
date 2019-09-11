import { useState, useLayoutEffect } from "react";
import { useBus } from "./react";
import { EventCreatorFn, BusEvent, SubscribeWithPayloadDispatchFn } from './types';

const useStateCreator = <E extends BusEvent = BusEvent>(
  subscriber: SubscribeWithPayloadDispatchFn<E>
) => (
  initState: E["payload"] | undefined
) => {
    const bus = useBus();

    const [state, dispatch] = useState<E["payload"]>(initState);

    useLayoutEffect(() => subscriber(dispatch, bus), [dispatch, bus]);

    return state;
  };

export function useBusState<E extends BusEvent = BusEvent>(
  initState: E["payload"] | undefined,
  event: EventCreatorFn<E>
): E["payload"] {
  const bus = useBus();

  const useState = useStateCreator((dispatch, bus) => {
    return bus.subscribe(event, (ev: E) => dispatch(ev.payload))
  });
  return useState(initState);
}

type UseBusStateOptions<E extends BusEvent> = {
  subscriber: SubscribeWithPayloadDispatchFn<E>;
};

useBusState.configure = <E extends BusEvent = BusEvent>(
  options: UseBusStateOptions<E>
) => {
  return useStateCreator(options.subscriber);
};