WebSocketServer;

state.listensTo(WebSocketServer.close.map(() => "close"));
x = [foo => bar, bax => bat];

// on connection, register an entailed/contingent process
// wss.on("connection", (socket, incoming_message) => {});

// optionally pipe error through
// wss.on("error", error => {});

// not useful that I know of
// wss.on("headers", (headers, incoming_message) => {});

// update state
// wss.on("listening", () => {});
// wss.on("close", () => {});
