const show = require("./lib/show");
const { q } = require("@def.codes/meld-core");
const { construct_pipeline } = require("./lib/construct-pipeline");
const { clusters_from } = require("./lib/clustering");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { LOVE_TRIANGLE } = require("./graphs/simple");
const { DADS_UPPER_ONTOLOGY } = require("./graphs/dads");

const TEST_CASES = [
  {
    label: `copy input`,
    triples: LOVE_TRIANGLE,
    pipeline: [[{ construct: q(`?s ?p ?o`) }]],
  },
  {
    label: `reverse love`,
    triples: LOVE_TRIANGLE,
    pipeline: [[{ construct: q(`?s loves ?o`), where: q(`?o loves ?s`) }]],
  },
  {
    label: `make love symmetrical`,
    triples: LOVE_TRIANGLE,
    pipeline: [
      [
        { construct: q(`?s ?p ?o`) },
        { construct: q(`?s loves ?o`), where: q(`?o loves ?s`) },
      ],
    ],
  },
  {
    label: `jealousy & pity`,
    triples: LOVE_TRIANGLE,
    pipeline: [
      [
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
      [
        {
          construct: q(`?x confronts ?z`),
          where: q(`?x pities ?y`, `?y jealousOf ?z`),
        },
      ],
    ],
  },
  {
    label: `DADS upper ontology`,
    triples: DADS_UPPER_ONTOLOGY,
    // this is unreadable, presumably because there are long labels
    pipeline: [
      [
        { construct: q(`?s a ?o`) },
        { construct: q(`?s rdfs:range ?o`) },
        { construct: q(`?s rdfs:domain ?o`) },
        { construct: q(`?s rdfs:subClassOf ?o`) },
      ],
    ],
  },
];

const main = test_case => {
  const { source, intermediate, final } = construct_pipeline(test_case);

  const statements = clusters_from({
    source: show.store(source),
    // intermediate: Object.fromEntries(
    //   Object.entries(intermediate).map(([key, store]) => [
    //     key,
    //     show.store(store),
    //   ])
    // ),
    final: show.store(final),
  });

  return {
    dot_graph: {
      directed: true,
      attributes: { label: test_case.label, labelloc: "t", rankdir: "LR" },
      statements,
    },
  };
};

exports.display = main(TEST_CASES[4]);
