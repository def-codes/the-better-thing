// scratch program for developing connected subgraph algorithm
const tx = require("@thi.ng/transducers");
const show = require("./lib/thing-to-dot-statements");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { clusters_from } = require("./lib/clustering");
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

let test_case = cases[0];

const test_triples = test_case; // tx.take(20, generate_triples());
const test_store = new RDFTripleStore(test_triples);
const { dot_statements: main } = dot_notate(test_store.triples);
const { annotations } = color_connected(test_store, { n: 20 });

const operation = q("thing a Operation");

const dot_statements = clusters_from({
  operation: dot_notate(operation).dot_statements,
  // outputs: [{ type: "node", id: "_" }],
  input: {
    _: [{ type: "node", id: "_", attributes: { style: "invis" } }],
    "as graph": main,
    // "as triples": show.things(test_store.triples).dot_statements,
  },
  intermediate: [],
  display: {
    _: [{ type: "node", id: "_", attributes: { style: "invis" } }],
    annotations,
    // "annotations object": show.things(annotations).dot_statements,
    colored: [...main, ...annotations],
  },
});

exports.display = {
  dot_graph: {
    directed: true,
    attributes: {
      rankdir: "LR",
      compound: true,
      layout: "fdp",
      // splines: "polyline",
    },
    statements: [
      {
        type: "edge",
        from: "input/_",
        to: "display/_",
        attributes: { ltail: "cluster input", lhead: "cluster display" },
      },
      ...dot_statements,
    ],
  },
};
