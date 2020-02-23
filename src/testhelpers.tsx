import React from "react";
import { EventBus } from "./EventBus";

export const bus = new EventBus();

import { EventEmitter2 } from "eventemitter2";
import { BusProvider } from "./BusContext";

export function mockEventBus() {
  const _unsubscribe = jest.fn();
  const subscribe = jest.fn(() => _unsubscribe);
  const publish = jest.fn();
  const emitter = new EventEmitter2();
  return { subscribe, emitter, publish, _unsubscribe };
}

export const wrapper = ({ children }: { children?: React.ReactNode }) => (
  <BusProvider value={bus}>{children}</BusProvider>
);
