import * as WebSocket from "ws";

const wss = new WebSocket.Server({ port: 2344 });

wss.on("connection", (socket, incoming_message) => {});
wss.on("error", error => {});
wss.on("headers", (headers, incoming_message) => {});
wss.on("listening", () => {});
// there is also close, but it's not defined in types
wss.on("close", () => {});
