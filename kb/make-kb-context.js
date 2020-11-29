const { rdf, HashMapDataset, PlanBuilder } = require("sparql-engine");
const level = require("level");
const levelgraph = require("levelgraph");
const fs = require("fs");
const { LevelRDFGraph } = require("./levelgraph-adapter");

const make_kb_context = options => {
  const db_index_path = options && options.db_index;

  if (!db_index_path) {
    throw new Error("An index location is required");
  }

  let stat;
  try {
    stat = fs.existsSync(db_index_path) && fs.statSync(db_index_path);
  } catch (error) {
    console.log("ERROR: ", error);
  }
  if (!stat || !stat.isDirectory) {
    throw new Error(
      `Expected db_index to point to a directory: ${db_index_path}`
    );
  }

  const db = levelgraph(level(db_index_path));

  // may want to configure this...
  const DEFAULT_GRAPH_IRI = "http://def.codes/meld#default-graph";
  const default_graph = new LevelRDFGraph(db);

  const dataset = new HashMapDataset(DEFAULT_GRAPH_IRI, default_graph);

  // This is required for PUT/POST operations in Graph Store Protocol
  dataset.setGraphFactory(iri => {
    const graph = new LevelRDFGraph(db);
    // TODO: but what if it already has this?
    dataset.addNamedGraph(iri, graph);
    return graph;
  });

  // Creates a plan builder for the RDF dataset
  const plan_builder = new PlanBuilder(dataset);

  return { dataset, plan_builder };
};

module.exports = { make_kb_context };
