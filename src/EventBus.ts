// Using EventEmitter2 in order to be able to use wildcards to subscribe to all events
import { EventEmitter2 as EventEmitter } from "eventemitter2";
import { BusEvent } from "./types";

type EventCreatorFn<T extends { type: string }> = ((...arg: any[]) => T) & {
  eventType: T["type"];
};

export function createEventCreator<T extends BusEvent>(type: T["type"]) {
  const eventCreator = (payload: T["payload"]) => ({ type, payload });
  eventCreator.eventType = type;
  return eventCreator as EventCreatorFn<T>;
}

export class EventBus {
  emitter = new EventEmitter({ wildcard: true });

  publish = <T extends BusEvent>(event: T) => {
    this.emitter.emit(event.type, event);
  };

  subscribe = <T extends BusEvent>(
    eventType: T["type"] | EventCreatorFn<T>,
    handler: (e: T) => void
  ) => {
    const type =
      typeof eventType === "string" ? eventType : eventType.eventType;

    this.emitter.on(type, handler);
    return () => {
      this.emitter.off(type, handler);
    };
  };
}
