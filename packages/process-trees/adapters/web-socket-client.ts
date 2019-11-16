// INVARIANT 1. it MUST entail incoming message ingress as `in`
// INVARIANT 2. it MUST entail outgoing message egress as `out`
// INVARIANT 3. it MUST die if the connection closes
// INVARIANT 4. it MUST close the connection of the process dies

// REIFY
//   - take a description (target address, options)
//   - general process stuff
// MESSAGES
//   - can emit errors (multiple times, doesn't go into error state, right?)
// STATE MACHINE
//   - can go (unrecoverably) into closed state
// ENTAILS
//   - an INGRESS (SINK) for receiving (buffer or encoded text) messages
//   - an EGRESS (EVENT/SOURCE) for sending messages
import { ISubsystemAdapter } from "./api";
import * as WebSocket from "ws";
import { StreamSource, subscription } from "@thi.ng/rstream";

// https://www.w3.org/TR/websockets/
const WEBSOCKET_CLIENT_TYPE_IRI =
  "https://www.w3.org/TR/websockets/#WebSocketClient";

interface WebSocketClientBlueprint {
  address: string;
  // ws supports a bunch of client options.
  // They are mostly pure data.  Could support if needed.
  // options?: WebSocket.ClientOptions;
}

// REFLECT
import { datafy_protocol } from "@def.codes/datafy-nav";
interface WebSocketClientDescription extends WebSocketClientBlueprint {
  "@type": typeof WEBSOCKET_CLIENT_TYPE_IRI;
  // TODO: add "@context" or use IRI's for properties
}
datafy_protocol.extend(
  WebSocket,
  (instance): WebSocketClientDescription => {
    return {
      "@type": WEBSOCKET_CLIENT_TYPE_IRI,
      address: instance.url,
    };
  }
);
/////

// STATE MACHINE
// you'd also want information about the states and transitions
const EVENTS = ["open", "close"] as const;
const as_state_machine = (
  client: WebSocket
): StreamSource<WebSocket["readyState"]> => sub => {
  const report_state = () => sub.next(client.readyState);
  report_state();
  EVENTS.forEach(event => client.on(event, report_state));
  return () => EVENTS.forEach(event => client.off(event, report_state));
};
/////

// REIFY
// Okay, so... this is a subsystem because it has entailed processes (input and output)
// but it can't entail just *anything*... only those things... right?

export const web_socket_client_adapter: ISubsystemAdapter<WebSocketClientBlueprint> = {
  type_iri: WEBSOCKET_CLIENT_TYPE_IRI,
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
