// RDF triple store -> Graph interface adapter
import * as tx from "@thi.ng/transducers";
import type * as RDF from "@def.codes/rdf-data-model";
import type {
  PseudoTriple,
  RDFTripleStore,
} from "@def.codes/rstream-query-rdf";
import type { IGraphView } from "./api";

export type PseudoTripleGraph = IGraphView<
  RDF.Term /*ID*/,
  RDF.Term /*Node*/,
  ReadonlySet<RDF.Term> /*Edge (predicates)*/
>;

export const rdf_triple_store_graph = ({
  store,
}: {
  store: RDFTripleStore;
}): IGraphView<any, any, any> => {
  const has = id => store.has(id);

  return {
    has,

    // Iterate node id's
    nodes: () => store.nodes.bind(store),

    get_node: id => (has(id) ? id : undefined),

    // Returns the set of predicates that obtain between the source and target.
    // Assumes a multigraph model, though, which the graph interface doesn't.
    get_edge: (subject, object) =>
      new Set(
        tx.filter(
          ([s, , o]) => s === subject && o === object,
          store.triples || []
        )
      ),

    // Inconistent with get_edge.
    *edges() {
      for (const [s, p, o] of store.triples) yield [s, o, p];
    },

    *nodes_with_data() {
      // As with `get_node`, yield the node itself as the value
      for (const node of store.nodes()) yield [node, node];
    },

    *edges_from(node) {
      // Super inefficient... but the underlying interface doesn't provide a
      // *synchronous* subject-based index.
      for (const [s, p, o] of store.triples) if (s === node) yield [o, p];
    },

    *adjacent(node) {
      // see above...
      for (const [s, p, o] of store.triples) {
        if (node === s) yield [o, p];
        if (node === o) yield [s, p];
      }
    },
  };
};
