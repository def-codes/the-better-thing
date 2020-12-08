const { rdf, HashMapDataset, PlanBuilder } = require("sparql-engine");
const { Store } = require("n3");
const { N3Graph } = require("./n3-adapter");

const make_kb_context = options => {
  const store = new Store();

  // may want to configure this...
  const DEFAULT_GRAPH_IRI = "http://def.codes/meld#default-graph";
  const default_graph = new N3Graph(store, DEFAULT_GRAPH_IRI);

  const dataset = new HashMapDataset(DEFAULT_GRAPH_IRI, default_graph);

  // This is required for PUT/POST operations in Graph Store Protocol
  dataset.setGraphFactory(iri => {
    console.log(`GRAPH FACTORY ${iri}`);
    const graph = new N3Graph(store, iri);
    // TODO: but what if it already has this?
    dataset.addNamedGraph(iri, graph);
    return graph;
  });

  // Creates a plan builder for the RDF dataset
  const plan_builder = new PlanBuilder(dataset);

  return { dataset, plan_builder };
};

module.exports = { make_kb_context };
