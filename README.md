<img src="logo.png" width="200" height="200"/>

# ts-bus

[![Build Status](https://travis-ci.org/ryardley/ts-bus.svg?branch=master)](https://travis-ci.org/ryardley/ts-bus)

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

# Example applications

To explore an example of ts-bs used in context pease see the [KanBan example](examples/kanban).

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

type TaskCreatedEvent = {
  type: "task.created";
  payload: {
    id: string;
    listId: string;
    value: string;
  };
};

export const taskCreated = defineEvent<TaskCreatedEvent>("task.created");
// Note we have to pass in a string as typescript does
// not allow for a way to create a string from typeland
// This is typed however so you should have
// autocompletion and should not find yourself making errors
```

_TIP_

> I find putting the event type inline within the definition leads to more concise event definition code

```ts
// Inline example
export const taskLabelUpdated = defineEvent<{
  type: "task.label.updated";
  payload: {
    id: string;
    label: string;
  };
}>("task.label.updated");
```

#### Subscription

Let's subscribe to our events

```ts
// main.ts
import { taskLabelUpdated, taskCreated } from "./event";
import { bus } from "./bus";

// You can subscribe using the event factory function should you wish
const unsubscribe = bus.subscribe(taskLabelUpdated, event => {
  const { id, label } = event.payload; // Event typing should be available
  doSomethingWithLabelAndId({ id, label });
});

// Unsubscribe to taskLabelUpdated after 20 seconds
setTimeout(unsubscribe, 20 * 1000);

// Or you can use plain old type strings
bus.subscribe("task.created", event => {
  const { listId, id, value } = event.payload;
  appendTaskToList(listId, { id, value });
});
```

#### Publishing events

Now let's publish our events somewhere

```ts
// publisher.ts
import { taskLabelUpdated, taskCreated } from "./events";
import { bus } from "./bus";

function handleUpdateButtonClicked() {
  bus.publish(taskLabelUpdated({ id: "638", label: "This is an event" }));
}

function handleDishesButtonClicked() {
  bus.publish(
    taskCreated({ id: "123", listId: "345", value: "Do the dishes" })
  );
}
```

### Using a plain event object

If you want to avoid the direct dependency with your event creator you can use the plain event object:

```tsx
bus.publish({
  type: "kickoff.some.process",
  payload: props.data
});
```

### Republishing events

Lets say you have received a remote event from a websocket and you need to prevent it from being automatically redispatched you can provide custom metadata with each publication of an event to prevent re-emmission of events over the socket.

```ts
// get an event from a socket
socket.on("event-sync", (event: BusEvent<any>) => {
  bus.publish(event, { remote: true });
});

// Prevent sending a event-sync if the event was remote
bus.subscribe("shared.*", event => {
  if (event.meta && event.meta.remote) return;
  socket.emit("event-sync", event);
});
```

### Wildcard syntax

You can namespace your events using period delimeters. For example:

```
"foo.*" matches "foo.bar"
"foo.*.thing" matches "foo.fing.thing"
"**" matches everything eg "foo" or "foo.bar.baz"
"*" matches everything within a single namespace eg. "foo" but not "foo.bar"
```

This is inherited directly from EventEmitter2 which ts-bus currently uses under the hood. I would like to investigate a stronger pattern matching syntax in the future that can take account of payload and event metadata. Submit an issue if you have ideas for syntax etc.

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

This connects state changes to bus events via a state reducer function.

```tsx
import { useBus, useBusReducer } from "ts-bus/react";

const initialState = {count: 0};

function reducer(state, event) {
  switch (event.type) {
    case 'counter.increment':
      return {count: state.count + 1};
    case 'counter.decrement':
      return {count: state.count - 1};
    default:
      throw new Error();
  }
}

function Counter() {
  const bus = useBus();
  const state = useBusReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => bus.publish({type: 'counter.increment'})}>+</button>
      <button onClick={() => bus.publish({type: 'counter.decrement'})}>-</button>
    </>
  );
}
```

