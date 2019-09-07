import { useEffect, useState, Dispatch, SetStateAction, useLayoutEffect } from "react";
import { useBus } from "./react";
import { BusEvent } from "./types";
import { EventCreatorFn } from './EventBus';

export function useBusState<E extends BusEvent = BusEvent>(
  initState: E["payload"] | undefined,
  event: EventCreatorFn<E>
): E["payload"] {
  const bus = useBus();

  const [state, dispatch] = useState<E["payload"]>(initState);

  useLayoutEffect(() => {
    const unsubscribe = bus.subscribe<E>(event, (v: E) => { dispatch(v.payload) });
    return () => { unsubscribe() };
  }, [dispatch, bus]);

  return state;
}