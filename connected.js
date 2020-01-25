// scratch program for developing connected subgraph algorithm
const tx = require("@thi.ng/transducers");
const show = require("./lib/show");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { clusters_from } = require("./lib/clustering");
const {
  traverse,
  triple_store_graph,
  component_nodes,
  connected_component_nodes,
} = require("@def.codes/graphs");
const { generate_triples } = require("./lib/random-triples");
const { color_connected } = require("./lib/color-connected");

// create test graph
const { q } = require("@def.codes/meld-core");
const cases = [
  [...tx.take(20, generate_triples())],
  q("a b c", "a b d", "a b e", "f b g", "f b h", "f b i"),
  q("a b c", "a b d", "a b e", "f b g", "f b h", "f b i", "o p p"),
  q("a b c", "c d e", "f g h", "g h i", "i j k", "k l a"),
  q("a p b", "c p d", "e p f", "g p h", "i p j", "k p m"),
];

let test_case = cases[0];

const test_triples = test_case;
const test_store = new RDFTripleStore(test_triples);
const main = show.store(test_store);
const { annotations } = color_connected(test_store, { n: 31 });

/*
  Notes on the notation

  A graph and its maximally connected components can be seen in a single
  notation by using an encoding channel (such as color) that supports visual 
  grouping of elements.

  The notation takes as an input a set of values from said encoding  channel
  (e.g. a set of colors).  These can be provided from a default source.

  This notation can be decomposed by viewing the mapping from node id's to
  assigned label (and thence to encoding), literally as a standalone map.

  The notation can be decomposed *temporally* by following the traversal
  used to label the nodes, which is a sequence of states.

  From here, it may be desirable to treat the output as a set of graphs (though
  see ff note).

  Note that the implementation used here yields a collection of sets of node
  id's, *not* subgraphs.  That is, it doesn't include edges in its result.
  Edges would belong to the component containing any of their associated
  vertices and thus subgraphs could be easily constructed.

  Closely related to this operation is the notion of connectedness (density of
  connections).
 */

const dot_statements = clusters_from({
  // outputs: [{ type: "node", id: "_" }],
  input: {
    _: [{ type: "node", id: "_", attributes: { style: "invis" } }],
    "as graph": main,
    // Might want to drill into this, but it would be hard to see if not as dot
    // whereas rest wants to be in FDP
    // "as triples": show.things(test_store.triples),
  },
  display: {
    // The annotation also takes as input the colors,
    // though that's not part of the operation itself
    _: [{ type: "node", id: "_", attributes: { style: "invis" } }],
    annotations,
    // see note above
    // "annotations object": show.things(annotations),
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
