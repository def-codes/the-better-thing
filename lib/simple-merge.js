const tx = require("@thi.ng/transducers");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { islands_from } = require("./islands");
const { simple_entailment_mapping, is_blank_node } = require("./graph-ops");

/**
 * Compute the difference between two graphs using simple entailment.
 *
 * Right?  This is actually not about merge at all.
 */
//
//
const merge_graphs_simple = (a, b) => {
  // console.log(`b.triples`, b.triples);

  // part 1: analyze incoming graph
  const part1 = islands_from(b, is_blank_node);
  const { islands } = part1;
  console.log(`idlands`, islands);

  // part 2: separate already-entailed subgraphs

  //   2a: for each resulting subgraph, attempt node mapping into target
  const mappings_base = islands.map(island => ({
    island,
    mapping: simple_entailment_mapping(a, new RDFTripleStore(island)),
  }));

  const extend = ({ island, mapping }) => {
    if (mapping.size === 0) {
      //   2c: if no match, map new minted bnodes to existing ones
      // but you don't necessarily want to do this
      // and only the caller knows
      const map = new Map();
      const sub = term => {
        return term;
        if (!is_blank_node(term)) return term;
        if (!map.has(term)) map.set(term, factory.blankNode());
        return map.get(term);
      };
      return { minted: island.map(([s, p, o]) => [sub(s), p, sub(o)]) };
    }
    // 2b: if match, discard (asserting that substituted facts exist)
    const sub = term => mapping.get(term) || term;
    return {
      entailed: island.map(triple => {
        const mapped = triple.map(sub);
        return { triple, mapped, pass: a.has(mapped) };
      }),
    };
  };

  const mappings = mappings_base.map(item => ({ ...item, ...extend(item) }));
  const incoming = [
    ...tx.mapcat(x => x, tx.keep(tx.map(_ => _.minted, mappings))),
    ...b.triples.filter(triple => !triple.some(is_blank_node)),
  ];

  return { ...part1, mappings, incoming };
};

const simple_merge_triples = (target, source) =>
  merge_graphs_simple(new RDFTripleStore(target), new RDFTripleStore(source));

module.exports = { simple_merge_triples, merge_graphs_simple };
