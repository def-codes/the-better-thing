const { rdf, HashMapDataset, PlanBuilder } = require("sparql-engine");
const { LevelRDFGraph } = require("./levelgraph-adapter");
const level = require("level");
const levelgraph = require("levelgraph");
const fs = require("fs");
const querystring = require("querystring");

const { fromN3 } = rdf;

const make_kb_service = options => {
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

  // Creates a plan builder for the RDF dataset
  const builder = new PlanBuilder(dataset);

  return { builder };
};

const with_kb_service = options => {
  const { kb_service } = options;
  const { builder } = kb_service;

  return async request => {
    const { body } = request;
    const { query, update } = querystring.decode(body);
    if (update) {
      const command = builder.build(update);
      await command.execute();
      return {
        status: 200,
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ update, success: true }),
      };
    } else if (query) {
      // Get an iterator to evaluate the query
      const iterator = builder.build(query);
      return new Promise((resolve, reject) => {
        const results = [];
        // Read results
        iterator.subscribe(
          bindings => {
            const result = {};
            const dict = bindings.toObject();
            for (const [key, value] of Object.entries(dict))
              result[key] = fromN3(value);
            results.push(result);
          },
          reject,
          () => {
            resolve({
              status: 200,
              headers: { "Content-type": "application/json" },
              body: JSON.stringify({ query, results }),
            });
          }
        );
      });
    }
  };
};

module.exports = { make_kb_service, with_kb_service };
