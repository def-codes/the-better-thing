// INVARIANT 1. it MUST reflect connections as contingent (entailed) processes
// INVARIANT 2. it MUST close the server when the process dies
// INVARIANT 3. it MUST die when the server is closed

// MESSAGES
//   - can emit errors (multiple times, doesn't go into error state, right?)
//
// STDIN:
// broadcast?
//
// STDOUT:
// ?
//
import { ISubsystemAdapter, ISystemCalls } from "./api";
import { Subsystem } from "./subsystem";
import * as WebSocket from "ws";

export const WEBSOCKET_SERVER_TYPE_IRI =
  "https://tools.ietf.org/html/rfc6455#WebSocketServer";

export interface WebSocketServerBlueprint {
  host: string;
  port: number;
}

// REFLECT
import { datafy_protocol } from "@def.codes/datafy-nav";
interface WebSocketServerDescription extends WebSocketServerBlueprint {
  "@type": typeof WEBSOCKET_SERVER_TYPE_IRI;
  // TODO: "@context" or use IRI's for properties
}
datafy_protocol.extend(
  WebSocket.Server,
  (instance): WebSocketServerDescription => {
    return {
      "@type": WEBSOCKET_SERVER_TYPE_IRI,
      host: instance.options.host,
      port: instance.options.port,
    };
  }
);
/////

// STATE MACHINE:
//   - starts in pending state and goes (at most once) into open state
//   - can go (unrecoverably) into closed state
import { StateMachineSpec } from "./state-machines";
export const web_socket_server_state_machine: StateMachineSpec = {
  states: {
    opening: {},
    listening: {},
    closed: { terminal: true },
  },
  transitions: [
    ["opening", "open", "listening"],
    ["listening", "close", "closed"],
  ],
  initial_state: "opening",
};
/////

interface WebSocketServerSubsystemState {
  readonly instance: WebSocket.Server;
  // INVARIANT 1. it MUST reflect connections as contingent (entailed) processes
  readonly connection_listener: (client: WebSocket) => void;
  // INVARIANT 3. it MUST die when the server is closed
  readonly closed_listener: () => void;
}

export class WebSocketServerSubsystem extends Subsystem {
  readonly state: WebSocketServerSubsystemState;

  constructor(
    readonly system: ISystemCalls,
    blueprint: WebSocketServerBlueprint
  ) {
    super(system);
    const instance = new WebSocket.Server(blueprint);

    // INVARIANT 1. it MUST reflect connections as contingent (entailed) processes
    const connection_listener = (client: WebSocket) => {
      // the client is a process contingent on this process
      this.system.reflect(client);
    };
    instance.on("connection", connection_listener);
    /////

    // INVARIANT 3. it MUST die when the server is closed
    const closed_listener = () => {
      this.die();
    };
    instance.on("close", closed_listener);
    /////

    this.state = { instance, connection_listener, closed_listener };
  }

  // INVARIANT 2. it MUST close the server when the process dies
  die() {
    this.dispose();
  }

  dispose() {
    const { instance, connection_listener, closed_listener } = this.state;
    // Should it be safe to do `removeAllListeners` here?

    // INVARIANT 1. it MUST reflect connections as contingent (entailed) processes
    instance.removeListener("connection", connection_listener);

    // INVARIANT 3. it MUST die when the server is closed
    instance.removeListener("close", closed_listener);

    // INVARIANT 2. it MUST close the server when the process dies
    instance.close();
  }
}

export const web_socket_server_adapter: ISubsystemAdapter<WebSocketServerBlueprint> = {
  type_iri: WEBSOCKET_SERVER_TYPE_IRI,
  reify(blueprint) {
    return {};
  },
  // the things (instances) come directly from mechanism.  need to be wrapped
  can_create_contingent_processes: true,
};
