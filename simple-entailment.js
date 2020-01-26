// test program for determination of simple entailment between two RDF graphs
const show = require("./lib/show");
const { q } = require("@def.codes/meld-core");
const { construct } = require("./lib/construct");
const { clusters_from } = require("./lib/clustering");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const pairs = require("./lib/example-graph-pairs");

// expect stores.  then they take care of their own bnode space issues
// returns
//   simply_entails: whether the first graph simply entails the second
//   intermediate: some mapping info
const { compare_graphs_simple } = require("./lib/compare-graphs");
const simple_entailment = (a, b) => {
  const intermediate = compare_graphs_simple(a, b);
  const simply_entails = undefined;

  return { intermediate, simply_entails };
};

const main = (label, test_case) => {
  const {
    source: a_triples,
    target: b_triples,
    a_entails_b: expect_a_entails_b,
    b_entails_a: expect_b_entails_a,
  } = test_case;
  const a = new RDFTripleStore(a_triples);
  const b = new RDFTripleStore(b_triples);

  const ab_result = simple_entailment(a, b);
  const { simply_entails: a_simply_entails_b } = ab_result;

  const ba_result = simple_entailment(a, b);
  const { simply_entails: b_simply_entails_a } = ba_result;

  const statements = clusters_from({
    a: show.store(a),
    b: show.store(b),
    result: show.thing({
      a_entails_b: { expect: expect_a_entails_b, actual: a_simply_entails_b },
      b_entails_a: { expect: expect_b_entails_a, actual: b_simply_entails_a },
    }),
  });

  return {
    dot_graph: {
      directed: true,
      attributes: { label, labelloc: "t" },
      statements,
    },
  };
};

const case_number = 0;
exports.display = main(...Object.entries(pairs)[case_number]);
