const show = require("./lib/show");
const { q } = require("@def.codes/meld-core");
const { construct } = require("./lib/construct");
const { clusters_from } = require("./lib/clustering");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { LOVE_TRIANGLE } = require("./graphs/simple");
const { DADS_UPPER_ONTOLOGY } = require("./graphs/dads");

/*
const examples = require("./lib/example-graph-pairs");
/// const { target } = examples["The author of Symposium is a student of Socrates"];
const source = q(
  "Alice loves _:b",
  "_:b loves Carol",
  "Carol loves Alice",
  "Dave loves Carol"
);
*/

const TEST_CASES = [
  {
    label: `copy input`,
    triples: LOVE_TRIANGLE,
    rules: [{ construct: q(`?s ?p ?o`) }],
  },
  {
    label: `reverse love`,
    triples: LOVE_TRIANGLE,
    rules: [{ construct: q(`?s loves ?o`), where: q(`?o loves ?s`) }],
  },
  {
    label: `make love symmetrical`,
    triples: LOVE_TRIANGLE,
    rules: [
      { construct: q(`?s ?p ?o`) },
      { construct: q(`?s loves ?o`), where: q(`?o loves ?s`) },
    ],
  },
  {
    label: `jealousy & pity`,
    triples: LOVE_TRIANGLE,
    rules: [
      { construct: q(`?s ?p ?o`) },
      {
        construct: q(
          "?x jealousOf ?z",
          "?y jealousOf ?x",
          "?z jealousOf ?y",
          "_:someone pities ?x"
        ),
        where: q("?x loves ?y", "?y loves ?z", "?z loves ?x"),
      },
    ],
  },
  {
    label: `DADS upper ontology`,
    triples: DADS_UPPER_ONTOLOGY,
    // this is unreadable, presumably because there are long labels
    rules: [{ construct: q(`?s ?p ?o`) }],
  },
];

const main = test_case => {
  const { label, triples, rules } = test_case;
  const source_store = new RDFTripleStore(triples);

  // Use same blank node space id to create “derived” graph
  const target_store = new RDFTripleStore([], source_store.blank_node_space_id);
  construct(rules, source_store, target_store);

  const statements = clusters_from({
    source: show.store(source_store),
    rules: show.things(rules),
    result: show.store(target_store),
  });

  return {
    dot_graph: {
      directed: true,
      attributes: { label, labelloc: "t" },
      statements,
    },
  };
};

exports.display = main(TEST_CASES[1]);
