const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { color_connected } = require("./lib/color-connected");

////////////////////////////////////////////
const tx = require("@thi.ng/transducers");
const { generate_triples } = require("./lib/random-triples");

// create test graph
const TEST_CASES = [
  [...tx.take(20, generate_triples())],
  q("a b c", "a b d", "a b e", "f b g", "f b h", "f b i"),
  q("a b c", "a b d", "a b e", "f b g", "f b h", "f b i", "o p p"),
  q("a b c", "c d e", "f g h", "g h i", "i j k", "k l a"),
  q("a p b", "c p d", "e p f", "g p h", "i p j", "k p m"),
];
//////////////////////////////////////

const main = test_case => {
  const test_triples = test_case;
  const test_store = new RDFTripleStore(test_triples);
  const input = show.store(test_store);
  const { annotations } = color_connected(test_store, { n: 31 });

  const statements = clusters_from({
    input,
    annotations,
    // "annotations object": show.things(annotations),
    colored: [...input, ...annotations],
  });

  return {
    dot_graph: {
      directed: true,
      attributes: { layout: "fdp" },
      statements,
    },
  };
};

exports.display = main(TEST_CASES[0]);
