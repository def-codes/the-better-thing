// Graph interface adapter for triple store.  Supports graph operations for RDF.
// Maybe could also do through protocols.
import * as tx from "@thi.ng/transducers";
import type * as RDF from "@def.codes/rdf-data-model";
import type { TripleStore } from "@thi.ng/rstream-query";
import type { PseudoTripleGraph } from "./rdf-triple-store-graph";
import { PseudoTriple } from "@def.codes/rstream-query-rdf";

const get_predicate = (spo: PseudoTriple): RDF.Term => spo[1];
const pluck_predicate = tx.map(get_predicate);

export const triple_store_graph = (store: TripleStore): PseudoTripleGraph => {
  const has = id => store.indexS.has(id) || store.indexO.has(id);

  function* nodes() {
    for (const s of store.indexS.keys()) yield s;
    for (const o of store.indexO.keys()) if (!store.indexS.has(o)) yield o;
  }

  return {
    has,

    get_node: id => (has(id) ? id : undefined),

    // Returns the set of predicates that obtain between the source and target.
    // Assumes a multigraph model, though, which the graph interface doesn't.
    get_edge: (subject, object) =>
      new Set(
        tx.iterator(
          tx.comp(
            tx.map(idx => store.triples[idx] as PseudoTriple),
            tx.filter(([, , o]) => object === o),
            pluck_predicate
          ),
          store.indexS.get(subject) || []
        )
      ),
    nodes,

    // Inconistent with get_edge.
    *edges() {
      for (const [s, p, o] of store.triples) yield [s, o, p];
    },

    *nodes_with_data() {
      // As with `get_node`, yield the node itself as the value
      for (const node of nodes()) yield [node, node];
    },

    *edges_from(node) {
      for (const i of store.indexS.get(node) || []) {
        const [, p, o] = store.triples[i];
        yield [o, p];
      }
    },

    *adjacent(node) {
      for (const i of store.indexS.get(node) || []) {
        const [, p, o] = store.triples[i];
        yield [o, p];
      }
      for (const i of store.indexO.get(node) || []) {
        const [s, p] = store.triples[i];
        yield [s, p];
      }
    },
  };
};
