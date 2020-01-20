const tx = require("@thi.ng/transducers");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { simple_entailment_mapping, is_blank_node } = require("./graph-ops");
const { simply_entailable_units } = require("./atomize");

// compare irrespective of whether subgraphs could be matched independently

/**
 * Directionally compare two graphs using simple entailment.
 *
 * Assumes that blank node labels in the two graphs are *not* compatible.
 * (Otherwise the comparison would be trivial.)
 *
 * If `b` contains blank nodes, we first identify one or more subgraphs that
 * might be independently entailed by `a`.  For each of these subgraphs, we
 * return either a mapping from its blank nodes to those in `a`.
 *
 */
const compare_graphs_simple = (a, b) => {
  const preprocess = simply_entailable_units(b);
  // const { islands, units } = preprocess;
  const { units } = preprocess;
  console.log(`units`, units);

  // separate already-entailed subgraphs
  //
  // what part of this operation coordinates across the islands?
  //
  const islands = units.filter(_ => !_.ground).map(_ => _.subgraph);
  // attempt to map each island into target
  const mappings_base = islands.map(island => ({
    island,
    mapping: simple_entailment_mapping(a, new RDFTripleStore(island)),
  }));

  const extend = ({ island, mapping }) => {
    if (mapping.size === 0) {
      // If no match, map new minted bnodes to existing ones
      //
      // BUT you don't necessarily want to do this
      // and only the caller knows
      const map = new Map();
      const sub = term => {
        // return term;
        if (!is_blank_node(term)) return term;
        if (!map.has(term)) map.set(term, factory.blankNode());
        return map.get(term);
      };
      return { minted: island.map(([s, p, o]) => [sub(s), p, sub(o)]) };
    }

    // Subgraph is entailed by `a`
    const sub = term => mapping.get(term) || term;
    return {
      // INVARIANT: `a.has(mapped)`
      entailed: island.map(triple => ({ triple, mapped: triple.map(sub) })),
    };
  };

  const mappings = mappings_base.map(item => ({ ...item, ...extend(item) }));
  const incoming = [
    ...tx.mapcat(x => x, tx.keep(tx.map(_ => _.minted, mappings))),
    ...b.triples.filter(triple => !triple.some(is_blank_node)),
  ];

  return { ...preprocess, mappings, incoming };
};

const compare_triples_simple = (target, source) =>
  compare_graphs_simple(new RDFTripleStore(target), new RDFTripleStore(source));

module.exports = { compare_triples_simple, compare_graphs_simple };
