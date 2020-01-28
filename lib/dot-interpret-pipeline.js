const { construct_pipeline } = require("./construct-pipeline");
const { dot_interpret_rdf_store } = require("./dot-interpret-rdf-store");

const dot_interpret_pipeline = ({ source, pipeline }) => {
  const construction = construct_pipeline({ source, pipeline });
  const { output } = construction;
  const interpreted = [...dot_interpret_rdf_store(output)];
  return { intermediate: { construction }, output: interpreted };
};

module.exports = { dot_interpret_pipeline };
