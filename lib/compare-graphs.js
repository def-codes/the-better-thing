const tx = require("@thi.ng/transducers");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { is_blank_node, is_ground_triple } = require("./rdf-operations");
const { simple_bnode_mapping } = require("./simple-bnode-mapping");
const { simply_entailable_units } = require("./atomize");

/**
 * *Directly comparable* means that no bnode mapping is needed to compare `b` to
 * `a`.  (Note that this is directional.)  Two graphs are directly comparable if
 * they use the same blank space *or* if the graph whose entailment is being
 * tested is ground.
 */
const directly_comparable = (a, b) =>
  a.blank_node_space_id === b.blank_node_space_id ||
  b.triples.every(is_ground_triple);

/**
 * Directionally compare two graphs using simple entailment.
 *
 * Assumes that blank node labels in the two graphs are *not* compatible.
 * (Otherwise the comparison would be trivial.)
 *
 * If `b` contains blank nodes, we first identify one or more subgraphs that
 * might be independently entailed by `a`.  For each of these subgraphs that
 * contains blank nodes, we return a mapping from its blank nodes to those in
 * `a`.  If this mapping is empty, it indicates that the subgraph is not
 * entailed.  Ground subgraphs are returned as-is.
 *
 */
const compare_graphs_simple = (a, b) => {
  const comparable = directly_comparable(a, b);

  if (comparable) {
    // There's no need to atomize the graph, nor to do bnode mapping Whatever
    // you do with this part, you can do to each of the separate parts in the
    // case when the graph is split up.
  }

  const preprocess = simply_entailable_units(b);
  const { units } = preprocess;

  // separate already-entailed subgraphs
  //
  // what part of this operation coordinates across the islands?
  // we close over the store, so we can deal in sets of triples with the bnode
  // space still in context.
  //
  const islands = units.filter(_ => !_.ground).map(_ => _.subgraph);
  // attempt to map each island into target
  const mappings = islands.map(island => ({
    island,
    mapping: simple_bnode_mapping(a, new RDFTripleStore(island)),
  }));

  // What does “incoming” mean here?  For bnode subgraphs, we've already checked
  // whether the subgraph is entailed, so we know up or down whether it's
  // already included.  For triples, we aren't doing that check.
  //
  // Get rid of this, it doesn't mean anything
  const incoming = [
    ...tx.mapcat(
      _ => _.island,
      tx.filter(_ => _.mapping.size === 0, mappings)
    ),
    ...b.triples.filter(triple => !triple.some(is_blank_node)),
  ];

  return { ...preprocess, mappings, incoming };
};

const compare_triples_simple = (target, source) =>
  compare_graphs_simple(new RDFTripleStore(target), new RDFTripleStore(source));

module.exports = { compare_triples_simple, compare_graphs_simple };
