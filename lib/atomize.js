const { islands_from } = require("./islands");
const { is_blank_node, is_ground_triple } = require("./graph-ops");

/**
 * Split a graph into atomically entailable units.
 *
 * Iterate the subgraphs that could be independently entailed by another graph.
 * For ground triples, this is the triple itself.  For triples with bnodes, this
 * consists of the smallest subgraph meeting the conditions of an $B!H(Bisland$B!I(B on
 * the predicate $B!H(Bis blank node$B!I(B.
 */

function simply_entailable_units(triples) {
  const preprocess = islands_from(triples, is_blank_node);
  const { components, islands } = preprocess;

  const units = [];
  for (const triple of triples)
    if (is_ground_triple(triple))
      units.push({ subgraph: [triple], ground: true });

  for (const subgraph of islands) units.push({ subgraph, ground: false });

  return { ...preprocess, units };
}

module.exports = { simply_entailable_units };
