// scratch program for developing connected subgraph algorithm
const tx = require("@thi.ng/transducers");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const {
  traverse,
  triple_store_graph,
  component_nodes,
  connected_component_nodes,
} = require("@def.codes/graphs");
const { generate_triples } = require("./lib/random-triples");
const { dot_notate } = require("./lib/dot-notate");

function test(triples, n) {
  const store = new RDFTripleStore(triples);
  const graph = triple_store_graph(store);
  let components, items;
  if (typeof n === "number") items = [...tx.take(n, component_nodes(graph))];
  else components = connected_component_nodes(graph);
  return { store, graph, items };
}

// create test graph
const { q } = require("@def.codes/meld-core");
const cases = [
  q("a b c", "a b d", "a b e", "f b g", "f b h", "f b i"),
  q("a b c", "a b d", "a b e", "f b g", "f b h", "f b i", "o p p"),
  q("a b c", "c d e", "f g h", "g h i", "i j k", "k l a"),
  q("a p b", "c p d", "e p f", "g p h", "i p j", "k p m"),
];

const colors = "red orange yellow green blue indigo violet gray pink darkblue".split(
  " "
);

let test_case = cases[3];

test_case = tx.take(20, generate_triples());
const { store, graph, components, items } = test(test_case, 20);
const annotations = [];

if (components)
  for (let i = 0; i < components.length; i++) {
    const ids = [...components[i]];
    for (const id of ids) {
      annotations.push({
        type: "node",
        id: id.value,
        attributes: { style: "filled", color: colors[i] },
      });
    }
  }
else
  for (const { subject, group } of items) {
    annotations.push({
      type: "node",
      id: subject.value,
      attributes: { style: "filled", color: colors[group] },
    });
  }

const { dot_statements: main } = dot_notate(store.triples);
const dot_statements = [...main, ...annotations];

exports.display = { dot_statements };
