# Example ts-bus driven app

This is a quick throw together app to demonstrate how you might put together an event bridge architecture using ts-bus and socket.io. It is not comprehensive. There are bugs. I plan to work on this when I get a chance and add things like auth etc. Happy for input / pull requests.

It demonstrates:

- Synchronising React Router with ts-bus. [here](https://github.com/ryardley/ts-bus/blob/master/examples/kanban/src/modules/routes/app.tsx#L12)
- Event synchronisation between browser and server. [here](https://github.com/ryardley/ts-bus/blob/master/examples/kanban/src/modules/event-sync/app.tsx#L8)
- Using `useBusReducer` [here](https://github.com/ryardley/ts-bus/blob/master/examples/kanban/src/modules/board/app.tsx#L9)

## Installation

Clone the repo
Go to the folder
Install dependencies

```
git clone git@github.com:ryardley/ts-bus.git
cd ts-bus/examples/kanban
yarn
```

### Launch

```
yarn start
```

Then open up two browser windows side by side and watch the events being sent to both browser windows.

### Production

This app is meant to be a local demo and has no production build yet.
