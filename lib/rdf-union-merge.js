const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");

/**
 * Return a new RDF triple store containing the union of two given stores.  If
 * the two stores share the same blank node space, then the union store will
 * share it as well.  Otherwise, the operation is the same as a merge.  See
 * https://www.w3.org/TR/rdf11-mt/#shared-blank-nodes-unions-and-merges
 *
 * > It is possible for two or more graphs to share a blank node, for example
 * > if they are subgraphs of a single larger graph or derived from a common
 * > source. In this case, the union of a set of graphs preserves the identity
 * > of blank nodes shared between the graphs.
 *
 */
const union_rdf_stores = (a, b) => {
  if (a.blank_node_space_id !== b.blank_node_space_id)
    // Is this right?
    return merge_rdf_stores(a, b);

  // The resulting store is in the same space.
  const store = new RDFTripleStore(a.triples, a.blank_node_space_id);
  store.into(b.triples);
  return { output: store };
};

/**
 * Return a new RDF triple store containing the merge of two given stores.  The
 * merge does not take into account the blank node spaces associated with the
 * given stores; that is, it never treats the blank nodes as shared.  The
 * returned store has its own, new blank node space.  See
 * https://www.w3.org/TR/rdf11-mt/#shared-blank-nodes-unions-and-merges
 *
 * > A related operation, called *merging*, takes the union after forcing any
 * > shared blank nodes, which occur in more than one graph, to be distinct in
 * > each graph. The resulting graph is called the *merge*.
 */
const merge_rdf_stores = (a, b) => {
  const store = new RDFTripleStore();
  store.import(a.triples);
  store.import(b.triples);
  return { output: store };
};

module.exports = { union_rdf_stores, merge_rdf_stores };
