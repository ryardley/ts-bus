import { EventBus, PredicateFn } from './EventBus';

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

export type UnsubscribeFn = () => any;

export type SubscriptionDef<E extends BusEvent = BusEvent> = E["type"] | EventTypeDescriptor<E> | PredicateFn | string

export type SubscribeFn<E extends BusEvent> = (
  dispatch: DispatchFn<E>,
  bus: EventBus
) => UnsubscribeFn;

export type SubscribeWithPayloadDispatchFn<E extends BusEvent> = (
  dispatch: DispatchFn<E["payload"]>,
  bus: EventBus
) => UnsubscribeFn;

export type EventCreatorFn<T extends { type: string; payload: any }> = ((
  payload: T["payload"]
) => T) &
  EventTypeDescriptor<T>;
