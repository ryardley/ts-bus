# TS Bus

A lightweight JavaScript/TypeScript event bus to help manage your application architecture.

## Usage

Create your EventBus globally somewhere:

```ts
// bus.ts
import { EventBus } from "ts-bus";
export const bus = new EventBus();
```

Next create some Events:

```ts
// events.ts
import { createEventCreator } from "ts-bus";

type FirstEvent = {
  type: "FIRST_EVENT";
  payload: {
    id: string;
    label: string;
  };
};

export const firstEvent = createEventCreator<FirstEvent>("FIRST_EVENT");

// Personally I prefer to put the event type inline as it is more concise:
export const otherEvent = createEventCreator<{
  type: "OTHER_EVENT";
  payload: { label:string }
};>("OTHER_EVENT");

// Note we have to pass in a string as typescript does not allow for a way to create a string from typeland
// This is typed however so you should have autocompletion and should not find yourself making errors
```

Let's subscribe to our events

```ts
// main.ts
import { firstEvent, otherEvent } from "./event";
import { bus } from "./bus";

const unsubscribe = bus.subscribe(firstEvent, event => {
  const { id, label } = event.payload; // Event typing should be available
  doSomethingWithFirstEvent({ id, label });
});

// Unsubscribe after 20 seconds
setTimeout(unsubscribe, 20 * 1000);
```

Elsewhere publish your event

```ts
// publisher.ts
import { firstEvent, otherEvent } from "./events";
import { bus } from "./bus";

function handleButtonClick() {
  bus.publish(firstEvent({ id: "my-id", label: "This is an event" }));
}

function handleButtonRightClick() {
  bus.publish(otherEvent({ label: "You right clicked" }));
}
```
