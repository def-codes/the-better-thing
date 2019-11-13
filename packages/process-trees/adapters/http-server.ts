// A toy server, I made it so it can work however I want
// REFLECT
//   - I don't remember how this works
// CREATES
//   - INGRESS (incoming requests)
// REIFY
import { ISubsystemAdapter } from "./api";
import {
  create_server,
  HttpServerOptions,
} from "@def.codes/simple-http-server";

// can datafy handlers?
export interface HttpServerBlueprint extends HttpServerOptions {}

export const http_server_adapter: ISubsystemAdapter<HttpServerBlueprint> = {
  // I'm not 100% sure about this
  //  - incoming requests are mapped to handlers and handled asynchronously
  //    - but is a promise a process?
  can_create_contingent_processes: true,
  reify(blueprint) {
    const server = create_server(blueprint);
    // processify...
    return {};
  },
};
