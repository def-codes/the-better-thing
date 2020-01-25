// atomize view
const tx = require("@thi.ng/transducers");
const { q } = require("@def.codes/meld-core");
const { simply_entailable_units } = require("./lib/atomize");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const show = require("./lib/thing-to-dot-statements");
const { generate_triples } = require("./lib/random-triples");
const { clusters_from } = require("./lib/clustering");
const { dot_notate } = require("./lib/dot-notate");
const pairs = require("./lib/example-graph-pairs");

const ATOMIZE_CASES = [
  {
    name: "SingleTriple",
    triples: q("a b c"),
  },
  {
    name: "SingleTripleWithVariable",
    triples: q("a b ?c"),
  },
  {
    name: "SingleTripleWithSubjectBnode",
    triples: q("_:a b c"),
  },
  {
    name: "SingleTripleWithObjectBnode",
    triples: q("a b _:c"),
  },
  {
    name: "BlankNodes",
    triples: q("_:A b C", "_:D e _:F", "_:G h I", "C z _:D", "_:G z C"),
  },
  {
    name: "RandomGraphViaAdapter",
    triples: [...tx.take(14, generate_triples())],
  },
  {
    name: "RDFTypeViaAdapter",
    triples:
      pairs[
        "bnodes with disconnected components"
        //"with multiple grounded triples to merge"
      ].target,
  },
];

const test_case_number = 4;
const { name, triples } = ATOMIZE_CASES[test_case_number];
const { units, ...preprocess } = simply_entailable_units(triples);

const dot_statements = clusters_from({
  store: dot_notate(triples).dot_statements,
  store_triples: show.things(triples).dot_statements,
  units_triples: show.things(units).dot_statements,
  units: Object.fromEntries(
    Object.entries(units).map(([index, { subgraph }]) => [
      index,
      dot_notate(subgraph).dot_statements,
    ])
  ),
});

exports.display = {
  dot_graph: {
    directed: true,
    attributes: { label: name, rankdir: "LR" },
    statements: dot_statements,
  },
};
