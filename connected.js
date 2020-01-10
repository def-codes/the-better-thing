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
const { color_connected } = require("./lib/color-connected");

// create test graph
const { q } = require("@def.codes/meld-core");
const cases = [
  q("a b c", "a b d", "a b e", "f b g", "f b h", "f b i"),
  q("a b c", "a b d", "a b e", "f b g", "f b h", "f b i", "o p p"),
  q("a b c", "c d e", "f g h", "g h i", "i j k", "k l a"),
  q("a p b", "c p d", "e p f", "g p h", "i p j", "k p m"),
];

let test_case = cases[3];

const test_triples = tx.take(20, generate_triples());
const test_store = new RDFTripleStore(test_triples);
const { dot_statements: main } = dot_notate(test_store.triples);
const { annotations } = color_connected(test_store, { n: 20 });
const dot_statements = [...main, ...annotations];

exports.display = { dot_statements };
