const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const tx = require("@thi.ng/transducers");
const { simply_entailable_units } = require("./lib/atomize");
const { generate_triples } = require("./lib/random-triples");
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

const main = ({ name, triples }) => {
  const { intermediate, output: units } = simply_entailable_units(triples);

  const dot_statements = clusters_from({
    store: show.triples(triples),
    store_triples: show.things(triples),
    // intermediate: show.thing(intermediate),
    units_triples: show.things(units),
    units: Object.fromEntries(
      Object.entries(units).map(([index, { subgraph }]) => [
        index,
        show.triples(subgraph),
      ])
    ),
  });

  return {
    dot_graph: {
      directed: true,
      attributes: { label: name, rankdir: "LR" },
      statements: dot_statements,
    },
  };
};

const test_case_number = 4;
exports.display = main(ATOMIZE_CASES[test_case_number]);
