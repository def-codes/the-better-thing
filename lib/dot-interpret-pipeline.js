const { construct_pipeline } = require("./construct-pipeline");
const { dot_interpret_rdf_store } = require("./dot-interpret-rdf-store");

const dot_interpret_pipeline = ({ triples, pipeline }) => {
  const construction = construct_pipeline({ triples, pipeline });
  const { final } = construction;
  const interpreted = [...dot_interpret_rdf_store(final)];
  return { construction, interpreted };
};

module.exports = { dot_interpret_pipeline };
