const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 1234, clientTracking: true });

const client1 = new WebSocket("ws://localhost:1234");

module.exports = { server, client1 };
