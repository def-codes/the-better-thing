const tx = require("@thi.ng/transducers");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { has_subgraph } = require("./store-operations");
const { is_ground_triple } = require("./rdf-operations");
const { simple_bnode_mapping } = require("./simple-bnode-mapping");
const { simply_entailable_units } = require("./atomize");

/**
 * *Directly comparable* means that no bnode mapping is needed to compare `b` to
 * `a`.  This is not commutative: two graphs are directly comparable if they use
 * the same blank node space or if the *second* graph is ground.
 */
const are_directly_comparable = (a, b) =>
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
  const same_bnode_space = a.blank_node_space_id === b.blank_node_space_id;
  const ground = b.triples.every(is_ground_triple);

  let atomized, units;

  // If the graphs are directly comparable, we can skip the partitioning and
  // mapping.
  if (same_bnode_space || ground) {
    const entailed = has_subgraph(a, b.triples);
    units = [{ subgraph: b.triples, ground, entailed }];
  } else {
    atomized = simply_entailable_units(b);
    units = atomized.output;
  }

  /*
  if (same_bnode_space || ground)
jjj    units = [
      { subgraph: b.triples, ground, entailed: has_subgraph(a, b.triples) },
    ];
*/

  const bnode_subgraphs = units.filter(_ => !_.ground).map(_ => _.subgraph);
  const bnode_mappings = bnode_subgraphs.map(island => ({
    island,
    mapping: simple_bnode_mapping(a, new RDFTripleStore(island)).output,
  }));

  return {
    intermediate: { atomized, bnode_subgraphs },
    output: bnode_mappings,
  };
};

const compare_triples_simple = (target, source) =>
  compare_graphs_simple(new RDFTripleStore(target), new RDFTripleStore(source));

module.exports = { compare_triples_simple, compare_graphs_simple };
