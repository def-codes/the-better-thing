// REFLECT
//   - can implement for WebSocket
//   - not sure how much of constructor info is available
//   - does it make sense to unreify with partial info given?
//     - because WSS will have that
// REIFY
//   - take a description (target address, options)
//   - general process stuff
//     - can emit errors (multiple times, doesn't go into error state, right?)
//   - like a state machine in that
//     - can go (unrecoverably) into closed state
//   - creates TWO things
//     - an INGRESS (SINK) for receiving (buffer or encoded text) messages
//     - an EGRESS (EVENT/SOURCE) for sending messages
import { ISubsystemAdapter, IDispose } from "./api";
import * as WebSocket from "ws";

interface WebSocketClientBlueprint {
  address: string;
}

export const web_socket_client_adapter: ISubsystemAdapter<WebSocketClientBlueprint> = {
  can_create_contingent_processes: false,

  // But isn't the whole point that you don't want to return an instance?
  // yet isn't doing this going to just cause a bunch of boilerplate?
  reify: blueprint => {
    const instance = new WebSocket(blueprint.address);
    // processify...
    return {};
  },
  // @ts-ignore
  wrap_instance(client: WebSocket): IDispose {
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
  },
};
