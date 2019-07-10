import React from "react";
import Board from "./board/app";
import Layout from "./layout/app";
import Routes from "./routes/app";
import EventSync from "./event-sync/app";

import { EventBus } from "ts-bus";
import { BusProvider } from "ts-bus/react";

// global bus
const bus = new EventBus();

function App() {
  return (
    <BusProvider value={bus}>
      <EventSync>
        <Layout>
          <Board>
            <Routes />
          </Board>
        </Layout>
      </EventSync>
    </BusProvider>
  );
}

export default App;
