const { islands_from } = require("./islands");
const { is_blank_node } = require("./rdf-operations");

/**
 * Split a graph into atomically entailable units.
 *
 * Iterate the subgraphs that could be independently entailed by another graph.
 * For ground triples, this is the triple itself.  For triples with bnodes, this
 * consists of the smallest subgraph meeting the conditions of an $B!H(Bisland$B!I(B on
 * the predicate $B!H(Bis blank node$B!I(B.
 *
 * *Note*: This treats variables like ground terms.
 */

function simply_entailable_units(triples) {
  const islands = islands_from(triples, is_blank_node);

  const units = [];
  for (const triple of triples)
    if (!triple.some(is_blank_node))
      units.push({ subgraph: [triple], ground: true });

  for (const subgraph of islands.output)
    units.push({ subgraph, ground: false });

  return { intermediate: { islands }, output: units };
}

module.exports = { simply_entailable_units };
