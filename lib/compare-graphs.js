const tx = require("@thi.ng/transducers");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { is_blank_node } = require("./rdf-operations");
const { simple_bnode_mapping } = require("./simple-bnode-mapping");
const { simply_entailable_units } = require("./atomize");

// compare irrespective of whether subgraphs could be matched independently
const atomic_compare = (a, b) => {
  // what do we want to return?
  // what are we telling?

  return;
};

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
  const preprocess = simply_entailable_units(b);
  const { units } = preprocess;

  // separate already-entailed subgraphs
  //
  // what part of this operation coordinates across the islands?
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
