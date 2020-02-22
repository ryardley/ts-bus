### Problem with the current API

`useBusReducer` is currently not a drop in replacement for `useReducer`

Namely the output is not an array with `[state, dispatch]`

This limits it's ease of applicability.

### Fixing useBusReducer should be easy

The way I see this working is that dispatch acts effectively as an alias to `bus.publish`.

```ts
const [state, dispatch] = useBusReducer(reducer, initialState);

dispatch(increment()); // basically an alias for `bus.publish(increment())`
```

This is pretty easy and makes the ability to attach the bus to any pre-existing React useReducer simple.

So that is super valuable and quite easy... HOWEVER!

### Problems with useBusState

The thing is as this is a **breaking change** we should probably update the other APIs as well. So I have been thinking about `useBusState`.

Currently we offer this:

```ts
const state = useBusState(0, eventCreator);
```

or we can configure a custom subscriber:

```ts
const useState = useBusState.configure({
  subscriber: (dispatch, bus) =>
    bus.subscribe(eventCreator, ev => dispatch(ev.payload))
});

const state = useState(0);
```

### Possible API

For the simple case I guess it could look something like this:

```ts
const setCountEvent = createEventDefinition()("setCountEvent");
const useState = useBusState.configure({ eventCreator: setCountEvent });

//...

const [count, setCount] = useState(0);
setCount(1); // `setCount(x)` is basically `bus.publish(setCountEvent(x))`
```

One question arises as to how should this work when you don't set an `eventCreator`?

It seems to me an event creator is mandatory as it allows us to provide ts-bus a string with which to disambiguate the state within the context of the application.

So I am wondering perhaps we should make this the first argument to configure?

```ts
const useState = useBusState.configure(setCountEvent);
```

We can still pass in a config object afterwards this opens up quite a few possibilities because the eventCreator will dictate the name space of the event (it can also be a string possibly?) and the subscriber can do any custom event mangling logic if that is ever required.

```ts
const doubler = (x: number) => x * 2;

const useState = useBusState.configure(setCountEvent, {
  subscriber: (dispatch, bus) =>
    bus.subscribe("**", ev => {
      dispatch(doubler(ev.payload));
    })
});

const [count, setCount] = useState(0);

setCount(1); // will re-render with 2
```

Anyway I might throw together a PR which includes an upgrade guide.
