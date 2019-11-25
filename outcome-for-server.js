// ASSUME fn's are resolved from interpreter context

module.exports = {
  server: {
    constructor: { function: "WebSocketServer", arguments: [{ port: 1234 }] },
  },
  client1: {
    constructor: { function: "WebSocket", arguments: ["ws://localhost:1234"] },
  },
  server_errors: {
    constructor: { function: "" },
  },
  // if it's a stream, you need *some* listener to kick it off, right?
  trace: {
    constructor: { function: "ConsoleSink", arguments: [] },
    listensTo: [{ local: "server", port: "error" }],
  },
};
