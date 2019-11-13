// REFLECT:
//   - this is a claim store
//   - but I'm not going to use TripleStore directly
//     - need to make various adaptations (for to use RDF terms, etc)
// CREATES
//   - a stateful thing
//   - that mutates its state based on incoming messages
// REIFY:
//   - type is essentially (non-named) rdf graph
// COMPONENT
//   - has its own internal dataflow that you could inspect (i.e. reflect)
//     - these are really implementation details and you shouldn't mess with them
//     - but it should still be possible to see how it's working internally
//   - adding a query
//     - creates a subscribable (a contingent process)
//
//
// QUESTIONS
// - how do you create (or rather attach) a query through IPC?
//   - the method call (like many)is synchronous request/response
//     - need to get away from that
// - is a query a subsystem?
//   - its values can drive assert -> construct
//     - but this is through transform, which must be done elsewhere
//     - the things thus created are in a different scope
import { ISubsystemAdapter } from "./api";
import { TripleStore } from "@thi.ng/rstream-query";

export interface TripleStoreBlueprint {}

export const triple_store_adapter: ISubsystemAdapter<TripleStoreBlueprint> = {
  type_iri: "http://thi.ng/rstream-query#TripleStore",
  // but creates them “on demand”, from a request that must be (?) IPC-based?
  can_create_contingent_processes: true,
  reify() {
    const instance = new TripleStore();
    // processify...
    return {};
  },
};
