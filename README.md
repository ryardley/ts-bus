<p align="center">
  <img src="logo.png" width="100" height="100"/>
</p>

<h1 align="center">
ts-bus
</h1>

#### A lightweight TypeScript event bus to help manage your application architecture

[![Build Status](https://travis-ci.org/ryardley/ts-bus.svg?branch=master)](https://travis-ci.org/ryardley/ts-bus)
[![codecov](https://codecov.io/gh/ryardley/ts-bus/branch/master/graph/badge.svg)](https://codecov.io/gh/ryardley/ts-bus)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ryardley/ts-bus/blob/master/LICENSE)

### Example

```ts
import { EventBus, createEventDefinition } from "ts-bus";

// Define Event
export const someEvent = createEventDefinition<{ url: string }>()("SOME_EVENT");

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

This is the kind of thing that you could use effectively in most applications.

For my purposes I wanted a system that:

- Is framework agnostic can support Vue, React or Angular.
- Could enable micro-frontends / microlithic architecture.
- Can easily use React hooks to reduce state in the case of React.
- Does not conflate eventing with state management.
- Has really good TypeScript support.

### Alternatives

- Redux - conflates state management with eventing and causes complexity around async as a result. Redux has a highly invasive syntax that is difficult to remove or abstract out of an application. React comes with state management out of the box these days anyway. See my article ["Life after Redux"](https://itnext.io/life-after-redux-21f33b7f189e?source=friends_link&sk=a2566ae4b3b28797505a1295d70392fe)
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

## Example applications

[With Redux Devtools](examples/with-redux-dev-tools).

## Usage

### Create a bus

Create your EventBus globally somewhere:

```ts
// bus.ts
import { EventBus } from "ts-bus";
export const bus = new EventBus();
```

### Declare events

Next create some Events:

```ts
// events.ts
import { createEventDefinition } from "ts-bus";

export const taskCreated = createEventDefinition<{
  id: string;
  listId: string;
  value: string;
}>()("task.created");

export const taskLabelUpdated = createEventDefinition<{
  id: string;
  label: string;
}>()("task.label.updated");
```

Notice `createEventDefinition()` will often be called with out a runtime check argument and it returns a function that accepts the event type as an argument. Whilst possibly a tiny bit awkward, this is done because it is [the only way we can allow effective discriminated unions](https://github.com/ryardley/ts-bus/issues/9). See [switching on events](#switching-on-events-and-discriminated-unions).

### Runtime payload checking

You can also provide a predicate to do runtime payload type checking in development. This is useful as a sanity check if you are working in JavaScript:

```js
import p from "pdsl";

// pdsl creates predicate functions
const isLabel = p`{
  id: string,
  label: string,
}`;

export const taskLabelUpdated = createEventDefinition(isLabel)(
  "task.label.updated"
);

taskLabelUpdated({ id: "abc" }); // {"id":"abc"} does not match expected payload.
```

These warnings are suppressed in production.

### Subscribing

```ts
import { taskLabelUpdated, taskCreated } from "./event";
import { bus } from "./bus";

// You can subscribe using the event creator function
bus.subscribe(taskLabelUpdated, event => {
  const { id, label } = event.payload; // Event is typed
  doSomethingWithLabelAndId({ id, label });
});
```

### Unsubscribing

To unsubscribe from an event use the returned unsubscribe function.

```ts
const unsubscribe = bus.subscribe(taskLabelUpdated, event => {
  // ...
});

unsubscribe(); // removes event subscription
```

### Subscribing with a type string

You can use the event type to subscribe.

```ts
bus.subscribe("task.created", event => {
  // ...
});
```

Or you can use [wildcards](#wildcard-syntax):

```ts
bus.subscribe("task.**", event => {
  // ...
});
```

### Subscribing with a predicate function

You can also subscribe using a predicate function to filter events.

```ts
// A predicate
function isSpecialEvent(event) {
  return event.payload && event.payload.special;
}

bus.subscribe(isSpecialEvent, event => {
  // ...
});
```

You may find [pdsl](https://github.com/ryardley/pdsl) a good fit for creating predicates.

### Subscription syntax

As you can see above you can subscribe to events by using the `subscribe` method of the bus.

```ts
const unsubscriber = bus.subscribe(<string|eventCreator|predicate>, handler);
```

This subscription function can accept a few different options for the first argument:

- A `string` that is the specific event type or a wildcard selector eg. `mything.**`.
- An `eventCreator` function returned from `createEventDefinition<PayloadType>()("myEvent")`
- A `predicate` function that will only subscribe to events that match the predicate. Note the predicate function matches the entire `event` object not just the payload. Eg. `{type:'foo', payload:'foo'}`

The returned `unsubscribe()` method will unsubscribe the specific event from the bus.

### Publishing events

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
import p from "pdsl";

// get an event from a socket
socket.on("event-sync", (event: BusEvent<any>) => {
  bus.publish(event, { remote: true });
});

// This is a shorthand utility that creates predicate functions to match based on a given object shape.
// For more details see https://github.com/ryardley/pdsl
const isSharedAndNotRemoteFn = p`{
  type: ${/^shared\./},
  meta: {
    remote: !true
  }
}`;

// Prevent sending a event-sync if the event was remote
bus.subscribe(isSharedAndNotRemoteFn, event => {
  socket.emit("event-sync", event);
});
```

### Switching on Events and Discriminated Unions

```ts
// This function creates foo events
const fooCreator = createEventDefinition<{
  foo: string;
}>()("shared.foo");

// This function creates bar events
const barCreator = createEventDefinition<{
  bar: string;
}>()("shared.bar");

// Create a union type to represent your app events
type AppEvent = ReturnType<typeof fooCreator> | ReturnType<typeof barCreator>;

bus.subscribe("shared.**", (event: AppEvent) => {
  switch (event.type) {
    case String(fooCreator):
      // compiler is happy about payload having a foo property
      alert(event.payload.foo.toLowerCase());
      break;
    case String(barCreator):
      // compiler is happy about payload having a bar property
      alert(event.payload.bar.toLowerCase());
      break;
    default:
  }
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

This is inherited directly from EventEmitter2 which ts-bus currently uses under the hood.

## React extensions

Included with `ts-bus` are some React hooks and helpers that provide a bus context as well as facilitate state management within React.

### BusProvider

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

### useBus

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

### useBusReducer

This connects state changes to bus events via a state reducer function.

Its signature is similar to useReducer except that it returns the state object instead of an array:

Example:

```ts
function init(initCount: number) {
  return { count: initCount };
}
const state = useBusReducer(reducer, initCount, init);
```

```tsx
import { useBus, useBusReducer } from "ts-bus/react";

const initialState = { count: 0 };

function reducer(state, event) {
  switch (event.type) {
    case "counter.increment":
      return { count: state.count + 1 };
    case "counter.decrement":
      return { count: state.count - 1 };
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
      <button onClick={() => bus.publish({ type: "counter.increment" })}>
        +
      </button>
      <button onClick={() => bus.publish({ type: "counter.decrement" })}>
        -
      </button>
    </>
  );
}
```

### Custom subscriber function

You can configure `useBusReducer` with a custom `subscriber` passing in an options object.

```ts
// get a new useReducer function
const useReducer = useBusReducer.configure({
  subscriber: (dispatch, bus) => {
    bus.subscribe("count.**", dispatch);
  }
});

const state = useReducer(/*...*/);
```

NOTE: Boilerplate can be reduced by using the `reducerSubscriber` function.

```ts
useBusReducer.configure({
  subscriber: reducerSubscriber("count.**")
});
```

#### Usage with Redux dev tools

You can use ts-bus with Redux Devtools by using [Reinspect](https://github.com/troch/reinspect).

Here is an example:

```tsx
import React from "react";
import { StateInspector, useReducer } from "reinspect";
import { EventBus, createEventDefinition } from "ts-bus";
import { BusProvider, useBus, useBusReducer } from "ts-bus/react";

const bus = new EventBus();

export default function AppWrapper() {
  return (
    <BusProvider value={bus}>
      <StateInspector name="App">
        <App />
      </StateInspector>
    </BusProvider>
  );
}

const useConfiguredBusReducer = useBusReducer.configure({
  useReducer: (reducer, initState, initializer) =>
    useReducer(reducer, initState, initializer, "appreducer") // passing in the reinspect id
});

const increment = createEventDefinition<void>()("increment");
const decrement = createEventDefinition<void>()("decrement");

function App() {
  const b = useBus();
  const state = useConfiguredBusReducer(
    (state, action) => {
      switch (action.type) {
        case `${increment}`: {
          return {
            ...state,
            count: state.count + 1
          };
        }
        case `${decrement}`: {
          return {
            ...state,
            count: state.count - 1
          };
        }
      }
      return state;
    },
    { count: 0 }
  );

  return (
    <div>
      <button onClick={() => b.publish(decrement())}>-</button>
      {state.count} <button onClick={() => b.publish(increment())}>+</button>
    </div>
  );
}
```

#### useBusReducer configuration

Available options:

| Option     | Description                               |
| ---------- | ----------------------------------------- |
| subscriber | Reducer subscriber definition             |
| useReducer | Alternate React.useReducer implementation |

### useBusState

This connects state changes to bus events via a useState equivalent function.

```tsx
import { useBus, useBusState } from "ts-bus/react";

const setCountEvent = createEventDefinition<number>()("SET_COUNT");

function Counter() {
  const bus = useBus();
  const count = useBusState(0, setCountEvent);

  return (
    <>
      Count: {count}
      <button onClick={() => bus.publish(setCountEvent(count + 1))}>+</button>
      <button onClick={() => bus.publish(setCountEvent(count - 1))}>-</button>
    </>
  );
}
```

#### useBusState configuration

You can configure useBusState with a subscriber passing in an options object.

```ts
// get a new useState function
const useState = useBusState.configure({
  subscriber: (dispatch, bus) => bus.subscribe("**", ev => dispatch(ev.payload))
});

const state = useState(/*...*/);
```

NOTE: The boilerplate code can be reduced by using the stateSubscriber function.

```ts
const useState = useBusState.configure({
  subscriber: stateSubscriber("**")
});
```

Available options:

| Option     | Description                 |
| ---------- | --------------------------- |
| subscriber | State subscriber definition |
