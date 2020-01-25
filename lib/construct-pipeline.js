const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { construct } = require("./construct");

// Reduce over a sequence of lists of construct queries
const construct_pipeline = ({ triples, pipeline }) => {
  const source = new RDFTripleStore(triples);
  const { blank_node_space_id } = source;

  // Results are carried into next operation --- but *not* initial triples
  const intermediate = [];
  let last_store;
  for (const queries of pipeline) {
    const next_store = new RDFTripleStore(
      last_store ? last_store.triples : [],
      blank_node_space_id
    );
    construct(queries, last_store || source, next_store);
    last_store = next_store;
    intermediate.push(next_store);
  }

  const final = intermediate[intermediate.length - 1];

  return { source, intermediate, final };
};

module.exports = { construct_pipeline };
