// A toy server, I made it so it can work however I want
// REFLECT
//   - I don't remember how this works
//   - the node server is actually a thing
//   - the interface is *really* hairy
//   - to processify it you need to make up something
//     - like the async handler we have, or better, iterator like WSGI
// ENTAILS
//   - INGRESS (incoming requests)
//   - really 2 things, and all async process based
//   - better suited to CSP (transient channels) than event/react
//   - request/response handler is purely functional (but async)
//   - network adapter has ingress but not really a separate egress
//     - i.e. you can't just send things outside of the context of a request
import { ISubsystemAdapter } from "./api";
import {
  create_server,
  HttpServerOptions,
} from "@def.codes/simple-http-server";

const HTTP_SERVER_TYPE_IRI = "http://meld/subsystem/WebServer";

// can datafy handlers?
export interface HttpServerBlueprint extends HttpServerOptions {}

// STATE MACHINE
// Has normal states (alive dead)
// Maybe a connecting state
/////

// REIFY:
//   - see meld demo.  I've done this several times over
//   - same goes for forces, which is a different kind of thing
import { reify_protocol } from "../reify/index";
reify_protocol.extend(
  HTTP_SERVER_TYPE_IRI,
  (description: HttpServerBlueprint, system) => {
    const server = create_server(description);
    // processify...
    return {};
  }
);
/////

export const http_server_adapter: ISubsystemAdapter<HttpServerBlueprint> = {
  type_iri: HTTP_SERVER_TYPE_IRI,
  // I'm not 100% sure about this
  //  - incoming requests are mapped to handlers and handled asynchronously
  //    - but is a promise a process?
  can_create_contingent_processes: true,
};
