const tx = require("@thi.ng/transducers");

/** Tell whether a given store has every fact in a sequence. */
const has_subgraph = (store, triples) => {
  for (const triple of triples) if (!store.has(triple)) return false;
  return true;
};

/**
 * Tell whether a given store has every fact in a sequence, with an optional
 * mapping of terms from the triples to the store.
 */
const has_mapped_subgraph = (store, triples, mapping) =>
  has_subgraph(
    store,
    mapping
      ? triples
      : tx.map(triple => triple.map(term => mapping.get(term) || term), triples)
  );

module.exports = { has_mapped_subgraph };
