import { useEffect, useState, Dispatch, SetStateAction, useLayoutEffect } from "react";
import { useBus } from "./react";
import { BusEvent } from "./types";

export function useBusState<E extends BusEvent = BusEvent>(
  event: E
): E["payload"] {
  const bus = useBus();

  const [state, dispatch] = useState<E["payload"]>(event.payload);

  useLayoutEffect(() => {
    const unsubscribe = bus.subscribe<E>(event.type, (v: E) => { dispatch(v.payload) });
    return () => { unsubscribe() };
  }, [dispatch, bus]);

  return state;
}