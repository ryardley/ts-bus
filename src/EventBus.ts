// Using EventEmitter2 in order to be able to use wildcards to subscribe to all events
import { EventEmitter2 as EventEmitter } from "eventemitter2";
import { BusEvent } from "./types";

type EventTypeDescriptor<T extends { type: string }> = {
  eventType: T["type"];
};

type PredicateFn = (...args: any[]) => boolean;

type EventCreatorFn<T extends { type: string; payload: any }> = ((
  payload: T["payload"]
) => T) &
  EventTypeDescriptor<T>;

function isEventDescriptor<T extends { type: string }>(
  descriptor: any
): descriptor is EventTypeDescriptor<T> {
  return !!descriptor && descriptor.eventType;
}

function isPredicateFn(descriptor: any): descriptor is PredicateFn {
  return !isEventDescriptor(descriptor) && typeof descriptor === "function";
}

export function defineEvent<T extends BusEvent>(type: T["type"]) {
  const eventCreator = (payload: T["payload"]) => ({
    type,
    payload
  });
  eventCreator.eventType = type;
  return eventCreator as EventCreatorFn<T>;
}

function getEventType(descriptor: string | EventTypeDescriptor<any>) {
  if (isEventDescriptor(descriptor)) return descriptor.eventType;
  return descriptor as string;
}

function filter(predicate: PredicateFn, handler: (a: any) => void) {
  return (event: any) => {
    if (predicate(event)) return handler(event);
  };
}

export class EventBus {
  emitter = new EventEmitter({ wildcard: true });

  publish = <T extends BusEvent>(event: T, meta?: any) => {
    this.emitter.emit(
      event.type,
      !meta ? event : { ...event, meta: { ...event.meta, ...meta } }
    );
  };

  subscribe = <T extends BusEvent>(
    eventType: T["type"] | EventTypeDescriptor<T> | PredicateFn,
    handler: (e: T) => void
  ) => {
    if (isPredicateFn(eventType)) {
      const filteredHandler = filter(eventType, handler);
      this.emitter.on("**", filteredHandler);
      return () => this.emitter.off("**", filteredHandler);
    }

    const type = getEventType(eventType);
    this.emitter.on(type, handler);
    return () => this.emitter.off(type, handler);
  };
}
