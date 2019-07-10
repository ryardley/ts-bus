import React, { useEffect } from "react";

import socketIOClient from "socket.io-client";
import { EventBus } from "ts-bus";
import { useBus } from "ts-bus/react";
import { BusEvent } from "ts-bus/types";

function setupSocket(bus: EventBus) {
  const socket = socketIOClient("localhost:4000");

  bus.subscribe("shared.**", event => {
    if (event.meta && event.meta.remote) return;
    socket.emit("event-sync", event);
  });

  socket.on("event-sync", (event: BusEvent) => {
    bus.publish(event, { remote: true });
  });
}

function EventSync({ children }: { children: React.ReactNode }) {
  const bus = useBus();
  useEffect(() => {
    setupSocket(bus);
  }, [bus]);
  return <>{children}</>;
}

export default EventSync;
