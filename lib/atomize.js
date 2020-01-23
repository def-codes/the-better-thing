const { islands_from } = require("./islands");
const { is_blank_node } = require("./graph-ops");

/**
 * Split a graph into atomically entailable units.
 *
 * Iterate the subgraphs that could be independently entailed by another graph.
 * For ground triples, this is the triple itself.  For triples with bnodes, this
 * consists of the smallest subgraph meeting the conditions of an “island” on
 * the predicate “is blank node”.
 *
 * *Note*: This treats variables like ground terms.
 */

function simply_entailable_units(triples) {
  const preprocess = islands_from(triples, is_blank_node);

  const { components, islands } = preprocess;

  const units = [];
  for (const triple of triples)
    if (!triple.some(is_blank_node))
      units.push({ subgraph: [triple], ground: true });

  for (const subgraph of islands) units.push({ subgraph, ground: false });

  return { ...preprocess, units };
}

module.exports = { simply_entailable_units };
