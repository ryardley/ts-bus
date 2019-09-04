import { useEffect, useState } from "react";
import { useBus } from "./react";
import { BusEvent } from "./types";

export function useBusState<E extends BusEvent = BusEvent>(
  initState: E["payload"] | undefined,
  event: E["type"]
) {
  const bus = useBus();

  const [state, dispatch] = useState<E["payload"]>(initState);

  useEffect(() => {
    const unsubscribe = bus.subscribe<E>(event, (v: E) => { dispatch(v.payload) });
    return () => { unsubscribe() };
  }, [dispatch, bus]);

  return state as E["payload"];
}