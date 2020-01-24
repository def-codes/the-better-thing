// use rules to create and annotate dot graphs
const tx = require("@thi.ng/transducers");
const show = require("./lib/thing-to-dot-statements");
const { construct } = require("./lib/construct");
const { dot_notate } = require("./lib/dot-notate");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { DOT } = require("@def.codes/graphviz-format");
const { dot_interpret_rdf_store } = require("./lib/dot-interpret-rdf-store");
const ConstructDot = require("./queries/construct-dot");
const pairs = require("./lib/example-graph-pairs");

const prep = (...cs) =>
  q(...cs.map(_ => _.replace(/dot:/g, DOT).replace(/ a /g, " rdf:type ")));

const CONSTRUCT_COPY = {
  name: "ConstructCopy",
  where: q("?s ?p ?o"),
  construct: q("?s ?p ?o"),
};

function do_case({ triples, queries1, queries2, queries3 }) {
  const source_store = new RDFTripleStore(triples);
  const target_store = new RDFTripleStore(
    source_store.triples,
    source_store.blank_node_space_id
  );
  construct(queries1, source_store, target_store);

  const second_target_store = new RDFTripleStore(
    target_store.triples,
    target_store.blank_node_space_id
  );
  construct(queries2, target_store, second_target_store);

  const third_target_store = new RDFTripleStore(
    second_target_store.triples,
    second_target_store.blank_node_space_id
  );
  construct(queries3, second_target_store, third_target_store);

  const interpreted = [...dot_interpret_rdf_store(third_target_store)];

  return { source_store, interpreted };
}

const TEST_TRIPLES = q(
  "Bob loves Alice",
  "Alice loves Carol",
  "Alice spouseOf Bob",
  "Bob spouseOf Alice",
  "Carol loves Alice"
);

const TEST_CASES = [
  {
    triples: TEST_TRIPLES,
    queries1: [ConstructDot.Node],
    queries2: [
      {
        where: prep("?node a dot:Node"),
        construct: prep(`?node dot:color "red"`, `?node dot:style filled`),
      },
      ConstructDot.Edge,
      ConstructDot.NodeLabel,
    ],
    queries3: [
      ConstructDot.EdgeLabel,
      {
        where: prep(
          "?edge def:represents ?statement",
          "?statement rdf:predicate loves"
        ),
        construct: prep(`?edge dot:color "red"`, `?edge dot:fontcolor "red"`),
      },
    ],
  },
  {
    triples: TEST_TRIPLES,
    queries1: [ConstructDot.Node],
    queries2: [ConstructDot.Edge, ConstructDot.NodeLabel],
    queries3: [ConstructDot.EdgeLabel],
  },
];

function main(test_case) {
  const { source_store, interpreted } = do_case(test_case);

  const dot_statements = clusters_from({
    source: dot_notate(source_store.triples).dot_statements,
    // source_triples: show.things(source_store.triples).dot_statements,
    // target: dot_notate(target_store.triples).dot_statements,
    // target_triples: show.things(target_store.triples).dot_statements,
    // second_target: dot_notate(second_target_store.triples).dot_statements,
    // second_target_triples: show.things(second_target_store.triples)
    //   .dot_statements,
    interpreted,
  }).map(_ => ({ ..._, attributes: { label: _.id.slice("cluster ".length) } }));

  return { dot_statements };
}

exports.display = main(TEST_CASES[0]);
