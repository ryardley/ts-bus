// Using EventEmitter2 in order to be able to use wildcards to subscribe to all events
import { EventEmitter2 as EventEmitter } from "eventemitter2";
import { BusEvent } from "./types";

function showWarning(msg: string) {
  /* istanbul ignore next */
  if (process && process.env && process.env.NODE_ENV !== "production") {
    console.warn(msg);
  }
}

type EventTypeDescriptor<T extends { type: string }> = {
  eventType: T["type"];
};

type PredicateFn = (...args: any[]) => boolean;

export type EventCreatorFn<T extends { type: string; payload: any }> = ((
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

type TestPredicateFn<P> = (payload: P) => boolean;

type EventDefinitionOptions<P> = {
  test?: (payload: P) => boolean;
};

export function createEventDefinition<P = void>(
  options?: EventDefinitionOptions<P> | TestPredicateFn<P>
) {
  return <T extends string>(type: T) => {
    function eventCreator(payload: P) {
      // Allow runtime payload checking for plain JavaScript usage
      if (options && payload) {
        const testFn = typeof options === "function" ? options : options.test;
        if (testFn && !testFn(payload)) {
          showWarning(
            `${JSON.stringify(payload)} does not match expected payload.`
          );
        }
      }

      return {
        type,
        payload
      };
    }
    eventCreator.eventType = type;
    eventCreator.toString = () => type; // allow String coercion to deliver the eventType
    return eventCreator;
  };
}

export function defineEvent<T extends BusEvent>(type: T["type"]) {
  showWarning(
    "defineEvent is deprecated and will be removed in the future. Please use createEventDefinition instead."
  );

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
