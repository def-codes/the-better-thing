// ASSUME fn's are resolved from interpreter context

// when you make a module, you're really describing a prototype
// the thing will be instantiated
//

module.exports = {
  server: {
    // PROTOTYPE.  right.
    constructor: { function: "WebSocketServer", arguments: [{ port: 1234 }] },
  },
  client1: {
    // PROTOTYPE.  right.
    constructor: { function: "WebSocket", arguments: ["ws://localhost:1234"] },
  },
  server_errors: {
    // PROTOTYPE.  right.
    constructor: { function: "" },
  },
  // if it's a stream, you need *some* listener to kick it off, right?
  trace: {
    // PROTOTYPE.  right.
    constructor: { function: "ConsoleSink", arguments: [] },
    listensTo: [{ local: "server", port: "error" }],
  },
};
