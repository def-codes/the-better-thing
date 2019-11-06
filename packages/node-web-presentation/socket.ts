// GOAL: implement one or more general process interfaces / ws adapter/driver

import * as WebSocket from "ws";
// import * as rs from "@thi.ng/rstream";

function socket_client_wrapper(client: WebSocket): IDispose {
  // The process dies if the client closes on its own
  const onclose = () => {
    // die, this process
  };
  client.addEventListener("close", onclose);
  return {
    dispose() {
      client.removeEventListener("close", onclose);
      client.close();
    },
  };
}

export function socket_server_wrapper(host: string, port: number): IDispose {
  const instance = new WebSocket.Server({ host, port });

  const connection_listener = (client: WebSocket) => {
    const wrapped_client = socket_client_wrapper(client);
    // the client is a process contingent on this process
    // whether we say so or not
    // Do we need to name this thing?
    // Give a blank node id?
  };
  instance.on("connection", connection_listener);

  // Don't work and wouldn't be typed
  // const connections = rs.fromEvent(instance, "connection");

  return {
    // But this also has to happen when the process closes on its own, right?
    dispose() {
      // Should it be safe to do `removeAllListeners` here?
      instance.removeListener("connection", connection_listener);
      instance.close();
    },
  };
}
