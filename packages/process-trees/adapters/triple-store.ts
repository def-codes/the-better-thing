// ENTAILS
//   - query processes (out ports) created on-demand
//   - SEE scopes.org for discussion
//   - triples COLLECTIONS
//   - queries CONTINGENT PROCESSES providing results collections
//     - a query spec is thus a separate thing, right?
// MESSAGES
//   - assert?
//   - retract?
// COMPONENT
//   - has its own internal dataflow that you could inspect (i.e. reflect)
//     - these are really implementation details and you shouldn't mess with them
//     - but it should still be possible to see how it's working internally
//
//
// QUESTIONS
// - is a query a subsystem?
//   - its values can drive assert -> construct
//     - but this is through transform, which must be done elsewhere
//     - the things thus created are in a different scope
import { ISubsystemAdapter } from "./api";
import { TripleStore } from "@thi.ng/rstream-query";

const TRIPLE_STORE_TYPE_IRI = "http://thi.ng/rstream-query#TripleStore";

export interface TripleStoreBlueprint {}

// REFLECT
// NOTE I'm not going to use TripleStore directly
//    need to make various adaptations (for to use RDF terms, etc)
import { datafy_protocol } from "@def.codes/datafy-nav";
export interface TripleStoreDescription extends TripleStoreBlueprint {
  "@type": typeof TRIPLE_STORE_TYPE_IRI;
}
datafy_protocol.extend(
  TripleStore,
  (instance): TripleStoreDescription => {
    return {
      "@type": TRIPLE_STORE_TYPE_IRI,
    };
  }
);
/////

export const triple_store_adapter: ISubsystemAdapter<TripleStoreBlueprint> = {
  // not exactly an RDF graph
  type_iri: TRIPLE_STORE_TYPE_IRI,
  // but creates them “on demand”, from a request that must be (?) IPC-based?
  can_create_contingent_processes: true,
  reify() {
    const instance = new TripleStore();
    // processify...
    return {};
  },
};
