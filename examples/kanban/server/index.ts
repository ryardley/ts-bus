import express from "express";
import { Server } from "http";
import socketIo from "socket.io";

const app = express();
const server = new Server(app);
const io = socketIo(server);

const PORT = process.env.PORT || 4000;
const eventCache: any[] = [];
server.listen(PORT, () => {
  console.log(`Listening on https://localhost:${PORT}`);
});

io.on("connection", function(socket) {
  eventCache.map(event => socket.emit("event-sync", event));
  socket.on("event-sync", event => {
    eventCache.push(event);
    socket.broadcast.emit("event-sync", event);
  });
});
