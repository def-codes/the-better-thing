const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { construct } = require("./construct");

// Reduce over a sequence of lists of construct queries
const construct_pipeline = ({ triples, pipeline }) => {
  // Assumes 3-element pipeline
  const [queries1, queries2, queries3] = pipeline;
  const source = new RDFTripleStore(triples);
  const first = new RDFTripleStore([], source.blank_node_space_id);
  construct(queries1, source, first);

  const second = new RDFTripleStore(first.triples, first.blank_node_space_id);
  construct(queries2, first, second);

  const third = new RDFTripleStore(second.triples, second.blank_node_space_id);
  construct(queries3, second, third);

  const final = third;

  return { source, intermediate: [first, second, third], final };
};

module.exports = { construct_pipeline };
