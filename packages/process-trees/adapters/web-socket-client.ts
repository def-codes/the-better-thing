// LABEL: web socket client
//
// INVARIANT 1. it MUST entail incoming message ingress as `in`
// INVARIANT 2. it MUST entail outgoing message egress as `out`
// INVARIANT 3. it MUST die if the connection closes
// INVARIANT 4. it MUST close the connection of the process dies
//
// MESSAGES:
//   - can emit errors (multiple times, doesn't go into error state, right?)
//
// ENTAILS:
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
// https://github.com/websockets/ws/blob/HEAD/doc/ws.md#class-websocket
/*
CONNECTING 	0 	The connection is not yet open.
OPEN 	1 	The connection is open and ready to communicate.
CLOSING 	2 	The connection is in the process of closing.
CLOSED 	3 	The connection is closed.
*/
import { StateMachineSpec } from "./state-machines";
const STATES = ["connecting", "open", "closing", "closed"] as const;
type WebSocketClientStateCode<
  T = typeof STATES
> = T extends readonly (infer E)[] ? E : never;
export const web_socket_client_state_machine: StateMachineSpec = {
  states: {
    connecting: { label: "The connection is not yet open." },
    open: { label: "The connection is open and ready to communicate." },
    closing: { label: "The connection is in the process of closing." },
    closed: { label: "The connection is closed." },
  },
  transitions: [
    ["connecting", "open?", "open"],
    ["open", "close?", "closing"],
    ["closing", "closed?", "closed"],
  ],
  initial_state: "connecting",
};
const EVENTS = ["open", "close"] as const;
const as_state_machine = (
  client: WebSocket
): StreamSource<WebSocketClientStateCode> => sub => {
  const report_state = () => sub.next(STATES[client.readyState]);
  report_state();
  EVENTS.forEach(event => client.on(event, report_state));
  return () => EVENTS.forEach(event => client.off(event, report_state));
};
/////

// REIFY
// Okay, so... this is a subsystem because it has entailed processes (input and output)
// but it can't entail just *anything*... only those things... right?
import { reify_protocol } from "../reify/index";
reify_protocol.extend(
  WEBSOCKET_CLIENT_TYPE_IRI,
  (description: WebSocketClientBlueprint, system) => {
    const client = new WebSocket(description.address);
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
  }
);
/////

export const web_socket_client_adapter: ISubsystemAdapter<WebSocketClientBlueprint> = {
  type_iri: WEBSOCKET_CLIENT_TYPE_IRI,
  can_create_contingent_processes: false,
};
