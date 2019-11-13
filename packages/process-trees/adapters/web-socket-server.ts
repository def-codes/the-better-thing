// REFLECT
//   - can implement for WebSocketServer
//   - not sure how much of constructor info is available
// REIFY
//   - take a description (host, port, options)
//   - general process stuff
//     - can emit errors (multiple times, doesn't go into error state, right?)
//   - like a state machine in that
//     - starts in pending state and goes (at most once) into open state
//     - can go (unrecoverably) into closed state
//   - what else does this create in its own right?
import { ISubsystemAdapter, IDispose } from "./api";
import { web_socket_client_adapter } from "./web-socket-client";
import * as WebSocket from "ws";

export interface WebSocketServerBlueprint {
  host: string;
  port: number;
}

export const web_socket_server_adapter: ISubsystemAdapter<WebSocketServerBlueprint> = {
  type_iri: "https://tools.ietf.org/html/rfc6455#WebSocketServer",
  // the things (instances) come directly from mechanism.  need to be wrapped
  can_create_contingent_processes: true,

  reify(blueprint) {
    const instance = new WebSocket.Server(blueprint);

    const connection_listener = (client: WebSocket) => {
      // processify
      // and report up the chain of command
      // @ts-ignore
      const wrapped_client = web_socket_client_adapter.wrap(client);
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
  },
};
