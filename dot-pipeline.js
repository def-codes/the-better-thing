// use rules to create and annotate dot graphs
const tx = require("@thi.ng/transducers");
const show = require("./lib/show");
const { construct } = require("./lib/construct");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { DOT } = require("@def.codes/graphviz-format");
const { dot_interpret_pipeline } = require("./lib/dot-interpret-pipeline");
const ConstructDot = require("./queries/construct-dot");
const Construct = require("./queries/construct-copy");
const pairs = require("./lib/example-graph-pairs");

const prep = (...cs) =>
  q(
    ...cs.map(_ =>
      _.replace(/dot:/g, DOT).replace(/(^|\s)a(\s|$)/g, "$1rdf:type$2")
    )
  );

const TRIANGLE = q("Bob loves Alice", "Alice loves Carol", "Carol loves Bob");
const TEST_TRIPLES = [
  ...TRIANGLE,
  ...q(
    "Alice spouseOf Bob",
    "Bob spouseOf Alice",
    "Carol loves Alice",
    "Dave knows Carol",
    "Dave likes Alice",
    "Dave golfsWith Bob"
  ),
];

const MORE_TRIPLES = pairs["bnodes with disconnected components"].target;

const TEST_CASES = [
  {
    label: "Dot represent nodes",
    triples: TRIANGLE,
    pipeline: [[Construct.Copy, ConstructDot.Node]],
  },
  {
    label: "Dot represent and label nodes",
    triples: TRIANGLE,
    pipeline: [[Construct.Copy, ConstructDot.Node], [ConstructDot.NodeLabel]],
  },
  {
    label: "Dot represent graph",
    triples: TRIANGLE,
    pipeline: [[Construct.Copy, ConstructDot.Node], [ConstructDot.Edge]],
  },
  {
    label: "Dot represent graph and label nodes",
    triples: TRIANGLE,
    pipeline: [
      [Construct.Copy, ConstructDot.Node],
      [ConstructDot.Edge],
      [ConstructDot.NodeLabel],
    ],
  },
  {
    label: "Dot represent graph and label nodes and edges",
    triples: TRIANGLE,
    pipeline: [
      [Construct.Copy, ConstructDot.Node],
      [ConstructDot.Edge],
      [ConstructDot.NodeLabel, ConstructDot.EdgeLabel],
    ],
  },
  {
    label: "show everything",
    triples: MORE_TRIPLES,
    pipeline: [
      [Construct.Copy, ConstructDot.Node],
      [ConstructDot.Edge, ConstructDot.NodeLabel],
      [ConstructDot.EdgeLabel],
    ],
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
    pipeline: [
      [
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
      [
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
      [
        ConstructDot.EdgeLabel,
        {
          where: prep(
            `?edge def:represents ?statement`,
            `?statement rdf:predicate a`
          ),
          construct: prep(
            `?edge dot:penwidth 10`,
            `?edge dot:color "#77000077"`
          ),
        },
      ],
    ],
  },
  {
    label: "show only certain predicates",
    triples: MORE_TRIPLES,
    pipeline: [
      [
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
      [ConstructDot.Edge, ConstructDot.NodeLabel],
      [
        ConstructDot.EdgeLabel,
        {
          // `?edge a dot:Edge` // apply to all
          where: prep(
            `?edge def:represents ?statement`,
            `?statement rdf:predicate tutorOf`
          ),
          construct: prep(
            `?edge dot:penwidth 10`,
            `?edge dot:color "#77000077"`
          ),
        },
      ],
    ],
  },
  {
    label: "Mark love and lovers as red",
    triples: TEST_TRIPLES,
    pipeline: [
      [Construct.Copy, ConstructDot.Node],
      [
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
      [
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
    ],
  },
];

function main(test_case) {
  const {
    construction: { source, intermediate },
    interpreted,
  } = dot_interpret_pipeline(test_case);

  const statements = clusters_from({
    source: show.store(source),
    intermediate: Object.fromEntries(
      Object.entries(intermediate).map(([key, store]) => [
        key,
        show.store(store),
      ])
    ),
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

exports.display = main(TEST_CASES[4]);
