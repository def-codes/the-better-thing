const ws = require("ws");

const construct = fn => (...args) => new fn(...args);

module.exports = {
  ConsoleSink: (...args) => console.log.bind(console),
  WebSocket: construct(ws),
  WebSocketServer: construct(ws.Server),
};
