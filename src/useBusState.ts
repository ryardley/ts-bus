import { useState, useLayoutEffect } from "react";
import { useBus } from "./react";
import { EventCreatorFn, BusEvent } from "./types";

export function useBusState<E extends BusEvent = BusEvent>(
  initState: E["payload"] | undefined,
  event: EventCreatorFn<E>
): E["payload"] {
  const bus = useBus();

  const [state, dispatch] = useState<E["payload"]>(initState);

  useLayoutEffect(() => {
    const unsubscribe = bus.subscribe<E>(event, (v: E) => {
      dispatch(v.payload);
    });
    return () => {
      unsubscribe();
    };
  }, [dispatch, bus]);

  return state;
}
