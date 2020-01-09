// scratch program for developing connected subgraph algorithm
const tx = require("@thi.ng/transducers");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const {
  traverse,
  triple_store_graph,
  connected_component_nodes,
} = require("@def.codes/graphs");
const { dot_notate } = require("./lib/dot-notate");

function test(triples) {
  const store = new RDFTripleStore(triples);
  const graph = triple_store_graph(store);
  const components = connected_component_nodes(graph);
  return { store, graph, components };
}

// create test graph
const { q } = require("@def.codes/meld-core");
const cases = [
  q("a b c", "a b d", "a b e", "f b g", "f b h", "f b i"),
  q("a b c", "a b d", "a b e", "f b g", "f b h", "f b i", "o p p"),
  q("a b c", "c d e", "f g h", "g h i", "i j k", "k l a"),
];

const colors = "red orange yellow green blue indigo violet".split(" ");

const { store, graph, components } = test(cases[2]);
const thing = components;
const { dot_statements } = dot_notate(store.triples);
console.log(`components`, components);

for (let i = 0; i < components.length; i++) {
  const ids = [...components[i]];
  for (const id of ids) {
    dot_statements.push({
      type: "node",
      id: id.value,
      attributes: { style: "filled", color: colors[i] },
    });
  }
}

exports.display = { dot_statements };
