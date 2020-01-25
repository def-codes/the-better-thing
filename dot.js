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
const Construct = require("./queries/construct-copy");
const pairs = require("./lib/example-graph-pairs");

const prep = (...cs) =>
  q(
    ...cs.map(_ =>
      _.replace(/dot:/g, DOT).replace(/(^|\s)a(\s|$)/g, "$1rdf:type$2")
    )
  );

function do_case({ triples, queries1, queries2, queries3 }) {
  const source = new RDFTripleStore(triples);
  const first = new RDFTripleStore([], source.blank_node_space_id);
  construct(queries1, source, first);

  const second = new RDFTripleStore(first.triples, first.blank_node_space_id);
  construct(queries2, first, second);

  const third = new RDFTripleStore(second.triples, second.blank_node_space_id);
  construct(queries3, second, third);

  const interpreted = [...dot_interpret_rdf_store(third)];

  return { source, first, second, third, interpreted };
}

const TEST_TRIPLES = q(
  "Bob loves Alice",
  "Alice loves Carol",
  "Alice spouseOf Bob",
  "Bob spouseOf Alice",
  "Carol loves Alice",
  "Dave knows Carol",
  "Dave likes Alice",
  "Dave golfsWith Bob"
);

const MORE_TRIPLES = pairs["bnodes with disconnected components"].target;

const TEST_CASES = [
  {
    label: "show everything",
    triples: MORE_TRIPLES,
    queries1: [Construct.Copy, ConstructDot.Node],
    queries2: [ConstructDot.Edge, ConstructDot.NodeLabel],
    queries3: [ConstructDot.EdgeLabel],
  },
  {
    label: "represent nodes and edges that partake in a type relationship",
    triples: prep(
      "Bob loves Alice",
      "Alice a Person",
      "Bob a Person",
      "Dave knows Alice",
      "Carol knows Joan"
    ),
    queries1: [
      Construct.Copy,
      {
        where: prep(`?s a ?o`),
        construct: prep(
          `_:sub a dot:Node`,
          `_:sub def:represents ?s`,
          `_:obj a dot:Node`,
          `_:obj def:represents ?o`
        ),
      },
    ],
    queries2: [
      // Variation on ConstructDot.Edge that specifies predicate `a` vs variable
      {
        where: prep(
          "?subject a ?object",
          "?from a dot:Node",
          "?from def:represents ?subject",
          "?to a dot:Node",
          "?to def:represents ?object"
        ),
        construct: prep(
          "_:edge a dot:Edge",
          "_:edge dot:from ?from",
          "_:edge dot:to ?to",
          "_:edge def:represents _:trip",
          "_:trip rdf:subject ?subject",
          "_:trip rdf:predicate a",
          "_:trip rdf:object ?object"
        ),
      },
      ConstructDot.NodeLabel,
    ],
    // Also mark the predicates
    queries3: [
      ConstructDot.EdgeLabel,
      {
        where: prep(
          `?edge def:represents ?statement`,
          `?statement rdf:predicate a`
        ),
        construct: prep(`?edge dot:penwidth 10`, `?edge dot:color "#77000077"`),
      },
    ],
  },
  {
    label: "show only certain predicates",
    triples: MORE_TRIPLES,
    queries1: [
      Construct.Copy,
      {
        // this is not working when predicate is `a`
        where: prep(`?s ?p ?o`),
        construct: prep(
          `_:sub a dot:Node`,
          `_:sub def:represents ?s`,
          `_:obj a dot:Node`,
          `_:obj def:represents ?o`
        ),
      },
    ],
    queries2: [ConstructDot.Edge, ConstructDot.NodeLabel],
    queries3: [
      ConstructDot.EdgeLabel,
      {
        // `?edge a dot:Edge` // apply to all
        where: prep(
          `?edge def:represents ?statement`,
          `?statement rdf:predicate tutorOf`
        ),
        construct: prep(`?edge dot:penwidth 10`, `?edge dot:color "#77000077"`),
      },
    ],
  },
  {
    label: "Mark love and lovers as red",
    triples: TEST_TRIPLES,
    queries1: [Construct.Copy, ConstructDot.Node],
    queries2: [
      {
        // could have a helper to produce these queries
        // like to make the Node/represents part implicit
        // could also do that with inference rules (but targeting only `dot:`?)
        where: prep(
          "?node a dot:Node",
          "?node def:represents ?x",
          "?x loves ?y"
        ),
        construct: prep(
          `?node dot:color "#CC000077"`,
          `?node dot:style "filled"`
        ),
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
        construct: prep(
          `?edge dot:penwidth 10`,
          `?edge dot:color "#CC000077"`,
          `?edge dot:fontcolor "#CC000077"`
        ),
      },
    ],
  },
];

function main(test_case) {
  const { source, first, second, third, interpreted } = do_case(test_case);

  const statements = clusters_from({
    source: dot_notate(source.triples).dot_statements,
    // source_triples: show.things(source_store.triples).dot_statements,
    first: dot_notate(first.triples).dot_statements,
    // first_triples: show.things(first.triples).dot_statements,
    second: dot_notate(second.triples).dot_statements,
    // second_target_triples: show.things(second_target_store.triples)
    //   .dot_statements,
    third: dot_notate(third.triples).dot_statements,
    interpreted,
  });

  return {
    dot_graph: {
      directed: true,
      attributes: { label: test_case.label, labelloc: "t", rankdir: "LR" },
      statements,
    },
  };
}

exports.display = main(TEST_CASES[1]);
