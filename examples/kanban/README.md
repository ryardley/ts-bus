# Example ts-bus driven app

This is a quick throw together app to demonstrate how you might put together an event bridge architecture using ts-bus and socket.io. It is not comprehensive. There are bugs. I plan to work on this when I get a chance and add things like auth etc. so it is a simple open source authenticated trello clone. Happy for input / pull requests.

It demonstrates:

- Synchronising React Router with ts-bus.
- Event synchronisation between browser and server
- Using `useBusReducer`

## Installation

Install dependencies

```
git clone git@github.com:ryardley/ts-bus.git
cd ts-bus/examples/kanban
yarn
```

### To run

```
yarn start
```

Then open up two browser windows side by side and watch the events being sent to both browser windows.
