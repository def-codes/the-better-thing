// ASSUME fn's are resolved from interpreter context

// when you make a module, you're really describing a prototype
// the thing will be instantiated.
//
// This is the result *after* the input arguments have been applied to the
// description function.
//
// There's also an execution context.

module.exports = {
  server: {
    extends: { ctor: "WebSocketServer", args: [{ port: 1234 }] },
  },
  client1: {
    extends: { ctor: "WebSocket", args: ["ws://localhost:1234"] },
  },
  server_errors: {
    extends: {},
  },
  // if it's a stream, you need *some* listener to kick it off, right?
  trace: {
    extends: { ctor: "ConsoleSink", args: [] },
    listensTo: [{ local: "server", port: "error" }],
  },
};
