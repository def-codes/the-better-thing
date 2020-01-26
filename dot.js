const show = require("./lib/show");
const { q } = require("@def.codes/meld-core");
const { clusters_from } = require("./lib/clustering");
const { dot_interpret_pipeline } = require("./lib/dot-interpret-pipeline");
const Construct = require("./queries/construct-copy");
const ConstructDot = require("./queries/construct-dot");
const pairs = require("./lib/example-graph-pairs");

const MORE_TRIPLES = pairs["bnodes with disconnected components"].target;

const TRIANGLE = q("Bob loves Alice", "Alice loves Carol", "Carol loves Bob");
const TEST_TRIPLES = [
  ...TRIANGLE,
  ...q(
    "Alice spouseOf Bob",
    "Bob spouseOf Alice",
    "Carol loves Alice",
    "Dave knows Carol",
    "Dave likes Alice",
    "Dave golfsWith Bob",
    "Eliot callsOn Joe",
    "Joe remembers Dave",
    "Alice despises Eliot"
  ),
];

/// Mirror: copies everything over as is
const DEFAULT_SPEC = {
  select_nodes: [Construct.Copy, ConstructDot.Node],
  select_edges: [ConstructDot.Edge],
  annotate: [ConstructDot.NodeLabel, ConstructDot.EdgeLabel],
};

const spec = [
  // these loops may repeat nodes, though, so they don't give what you'd expect
  // 5-node loops.
  [
    [
      {
        construct: q(
          "?x ?p1 ?y1",
          "?y1 ?p2 ?y2",
          "?y2 ?p3 ?y3",
          "?y3 ?p4 ?y4",
          "?y4 ?p5 ?x"
        ),
      },
    ],
    [ConstructDot.Node],
    [ConstructDot.Edge],
    [ConstructDot.NodeLabel, ConstructDot.EdgeLabel],
  ],
  // 4-node loops.
  [
    [
      {
        construct: q("?x ?p1 ?y1", "?y1 ?p2 ?y2", "?y2 ?p3 ?y3", "?y3 ?p4 ?x"),
      },
    ],
    [ConstructDot.Node],
    [ConstructDot.Edge],
    [ConstructDot.NodeLabel, ConstructDot.EdgeLabel],
  ],
  // 3-node loops.
  [
    [{ construct: q("?x ?p1 ?y1", "?y1 ?p2 ?y2", "?y2 ?p3 ?x") }],
    [ConstructDot.Node],
    [ConstructDot.Edge],
    [ConstructDot.NodeLabel, ConstructDot.EdgeLabel],
  ],
  // 2-node loops.
  [
    [{ construct: q("?x ?p1 ?o1", "?o1 ?p2 ?x") }],
    [ConstructDot.Node],
    [ConstructDot.Edge],
    [ConstructDot.NodeLabel, ConstructDot.EdgeLabel],
  ],
  // every type designation
  [
    [{ construct: q("?s a ?o") }],
    [ConstructDot.Node],
    [ConstructDot.Edge],
    [ConstructDot.NodeLabel, ConstructDot.EdgeLabel],
  ],
  // everything about Plato (DESCRIBE)
  [
    [{ construct: q("Plato ?p ?o") }, { construct: q("?s ?p Plato") }],
    [ConstructDot.Node],
    [ConstructDot.Edge],
    [ConstructDot.NodeLabel, ConstructDot.EdgeLabel],
  ],
  // select just the people (and person type)
  [
    [{ construct: q("?s a Person") }],
    [ConstructDot.Node],
    [ConstructDot.Edge],
    [ConstructDot.NodeLabel, ConstructDot.EdgeLabel],
  ],
][0];

function do_case(triples, pipeline) {
  return dot_interpret_pipeline({ triples, pipeline });
}

const input = TEST_TRIPLES;

const { interpreted: output } = do_case(input, spec);

const statements = clusters_from({
  INPUT: show.triples(input),
  // rules: show.thing(spec),
  // output_1: show.things(output),
  output,
});

exports.display = {
  dot_graph: {
    directed: true,
    // attributes: { label: test_case.label, labelloc: "t", rankdir: "LR" },
    statements,
  },
};
