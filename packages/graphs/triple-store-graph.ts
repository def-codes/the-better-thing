// Graph interface wrapper for triple store.  Supports graph operations for RDF.
// Maybe could also do through protocols.
// this would be a good case for `import type`.  see TS 3.8
import { TripleStore } from "@thi.ng/rstream-query";
import { IGraphIterator, IAdjacencyListReader } from "./api";

export const triple_store_graph = (
  store: TripleStore
): IGraphIterator<any, any, any> & IAdjacencyListReader<any, any> => {
  return {
    *nodes() {
      for (const s of store.indexS.keys()) yield s;
      for (const o of store.indexO.keys()) if (!store.indexS.has(o)) yield o;
    },
    *edges() {
      for (const [s, p, o] of store.triples) yield [s, o, p];
    },
    *nodes_with_data() {
      // Yeah, you could pull all the facts for this node
      for (const node of store.indexS.keys()) yield [node, null];
    },
    *edges_from(node) {
      for (const i of store.indexS.get(node) || []) {
        const [, p, o] = store.triples[i];
        yield [o, p];
      }
    },
  };
};
