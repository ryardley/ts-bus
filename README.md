<img src="logo.png" width="200" height="200"/>

# ts-bus

A lightweight TypeScript event bus to help manage your application architecture.

### Example

```ts
import { EventBus, defineEvent } from "ts-bus";

// Define Event
type SomeEvent = {
  type: "SOME_EVENT";
  payload: { url: string };
};

export const someEvent = defineEvent<SomeEvent>("SOME_EVENT");

// Create bus
const bus = new EventBus();

// Subscribe
bus.subscribe(someEvent, event => {
  alert(event.payload.url);
});

// Publish
bus.publish(someEvent({ url: "https://github.com" }));
```

### Rationale

We want to write loosely coupled highly cohesive applications and one of the best and easiest ways to do that is to use an event bus as a management layer for our applications.

This is the kind of thing that you could use effectively in any application.

For my purposes I wanted a system that:

- Is framework agnostic can support Vue, React or Angular.
- Could enable micro-frontends / microlithic architecture.
- Can easily use React hooks to reduce state in the case of React.
- Does not conflate eventing with state management.
- Has really good TypeScript support.

### Alternatives

- Redux - conflates state management with eventing and causes complexity around async as a result. React comes with state management out of the box these days anyway.
- RxJS - could make a great event bus but feels too heavy handed for use with many projects.
- Node `events` - is a little too much API for what I need here. This lib actually decorates the `EventEmitter2` package. In the future I may remove it to become dependency free.

## Installation

Use your favourite npm client to install ts-bus. Types are included automatically.

Npm:

```bash
npm install ts-bus
```

Yarn:

```bash
yarn add ts-bus
```

## Usage

#### Create a bus

Create your EventBus globally somewhere:

```ts
// bus.ts
import { EventBus } from "ts-bus";
export const bus = new EventBus();
```

#### Declare events

Next create some Events:

```ts
// events.ts
import { defineEvent } from "ts-bus";

type FirstEvent = {
  type: "FIRST_EVENT";
  payload: {
    id: string;
    label: string;
  };
};

export const firstEvent = defineEvent<FirstEvent>("FIRST_EVENT");
// Note we have to pass in a string as typescript does
// not allow for a way to create a string from typeland
// This is typed however so you should have
// autocompletion and should not find yourself making errors
```

_TIP_

> I find putting the event type inline within the definition leads to more concise event definition code

```ts
// Inline example
export const otherEvent = defineEvent<{
  type: "OTHER_EVENT";
  payload: { label:string }
};>("OTHER_EVENT");
```

#### Subscription

Let's subscribe to our events

```ts
// main.ts
import { firstEvent, otherEvent } from "./event";
import { bus } from "./bus";

// You can subscribe using the event factory function should you wish
const unsubscribe = bus.subscribe(firstEvent, event => {
  const { id, label } = event.payload; // Event typing should be available
  doSomethingWithFirstEvent({ id, label });
});

// Or you can use plain old type strings
bus.subscribe("OTHER_EVENT", event => {
  doSomethingWithOtherEvent(event.payload.label);
});

// Unsubscribe after 20 seconds
setTimeout(unsubscribe, 20 * 1000);
```

#### Publishing events

Now let's publish our events somewhere

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

_TIP:_

> If you want to avoid the direct dependency with your event creator you can use the plain event object:

```tsx
bus.publish({
  type: "KICKOFF_SOME_PROCESS",
  payload: props.data
});
```

That's pretty much the basics of `ts-bus`

## React extensions

Included with `ts-bus` are some React hooks and helpers that provide a bus context as well as facilitate state management within React.

#### BusProvider

Wrap your app using the `BusProvider`

```tsx
import React from "react";
import App from "./App";

import { EventBus } from "ts-bus";
import { BusProvider } from "ts-bus/react";

// global bus
const bus = new EventBus();

// This wraps React Context and passes the bus to the `useBus` hook.
export default () => (
  <BusProvider value={bus}>
    <App />
  </BusProvider>
);
```

#### useBus

Access the bus instance with `useBus`

```tsx
// Dispatch from deep in your application somewhere...
import { useBus } from "ts-bus/react";
import { kickoffSomeProcess } from "./my-events";

function ProcessButton(props) {
  // Get the bus passed in from the top of the tree
  const bus = useBus();

  const handleClick = React.useCallback(() => {
    // Fire the event
    bus.publish(kickoffSomeProcess(props.data));
  }, [bus]);

  return <Button onClick={handleClick}>Go</Button>;
}
```

#### useBusReducer

This can be used as a much more flexible alternative to Redux because not every event requires a corresponding state change. Also you can hook multiple frameworks together and create microfrontends with this technique.

```tsx
import { useBusReducer } from "ts-bus/react";

function Main(props: Props) {
  // Automatically hook into bus passed in with
  // BusProvider above in the tree
  const state = useBusReducer(
    produce(initState, (state, action) => {
      switch (action.type) {
        case "TASK_MOVED": {
          // ...
          return state;
        }
        case "TASK_CREATED": {
          // ...
          return state;
        }
        case "TASK_UPDATED": {
          // ...
          return state;
        }
        default:
          return state;
      }
    })
  );

  return <MyApp state={state}>{children}</MyApp>;
}
```
