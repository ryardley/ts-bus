import { EventBus } from "./EventBus";

export type BusEvent<T extends object = any> = {
  type: string;
  payload: T;
  meta?: any;
};

export type EventTypeDescriptor<T extends { type: string }> = {
  eventType: T["type"];
};

export type EventFrom<T extends (...args: any) => BusEvent> = ReturnType<T>;

export type DispatchFn<E> = (a: E) => void;

type UnsubscribeFn = () => any;

export type SubscribeFn<E extends BusEvent> = (
  dispatch: DispatchFn<E>,
  bus: EventBus
) => UnsubscribeFn;

export type EventCreatorFn<T extends { type: string; payload: any }> = ((
  payload: T["payload"]
) => T) &
  EventTypeDescriptor<T>;
