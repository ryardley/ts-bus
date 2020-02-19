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
