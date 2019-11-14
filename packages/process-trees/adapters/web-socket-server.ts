// INVARIANT 1. it MUST reflect connections as contingent (entailed) processes
// INVARIANT 2. it MUST close the server when the process dies
// INVARIANT 3. it MUST die when the server is closed

// REFLECT
//   - can implement for WebSocketServer
//   - options are in fact available on WebSocketServer object
// MESSAGES
//   - can emit errors (multiple times, doesn't go into error state, right?)
// STATE MACHINE:
//   - starts in pending state and goes (at most once) into open state
//   - can go (unrecoverably) into closed state
import { ISubsystemAdapter, ISystemCalls } from "./api";
import { Subsystem } from "./subsystem";
import * as WebSocket from "ws";

export interface WebSocketServerBlueprint {
  host: string;
  port: number;
}

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
  type_iri: "https://tools.ietf.org/html/rfc6455#WebSocketServer",
  // the things (instances) come directly from mechanism.  need to be wrapped
  can_create_contingent_processes: true,
};
