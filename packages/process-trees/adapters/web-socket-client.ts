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
// ENTAILS
//   - an INGRESS (SINK) for receiving (buffer or encoded text) messages
//   - an EGRESS (EVENT/SOURCE) for sending messages
import { ISubsystemAdapter } from "./api";
import * as WebSocket from "ws";

interface WebSocketClientBlueprint {
  address: string;
  // ws supports a bunch of client options.
  // They are mostly pure data.  Could support if needed.
  // options?: WebSocket.ClientOptions;
}

export const web_socket_client_adapter: ISubsystemAdapter<WebSocketClientBlueprint> = {
  // https://www.w3.org/TR/websockets/
  type_iri: "https://www.w3.org/TR/websockets/#WebSocketClient",
  can_create_contingent_processes: false,

  reify: blueprint => {
    const client = new WebSocket(blueprint.address);
    // The process dies if the client closes on its own
    const onclose = () => {
      // die, this process
    };

    // provide this to super mechanism as sink
    // but special error/close handling here?
    const entailed_ingress = subscription({
      next(message) {
        client.send(message);
      },
    });

    // provide this to super mechanism as source
    // essentially, from event
    const entailed_egress = sub => {
      client.on("message", data => sub.next(data));
      return () => {
        // Should do this here?
        client.close();
      };
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
