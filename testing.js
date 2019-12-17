const es = require("@def.codes/expression-reader");
const si = require("@def.codes/simple-interpreter");
const dot = require("@def.codes/graphviz-format");
const { traverse } = require("@def.codes/graphs");
const {
  make_object_graph_traversal_spec,
  object_graph_dot_notation_spec,
} = require("@def.codes/node-web-presentation");
const { mark_nodes_matching } = require("./lib/marking");
const { random_dgraph } = require("./lib/random-dgraph");
const { some_ast } = require("./lib/some-ast");
const { evaluate_cases } = require("./lib/evaluate-cases");
const { empty_like_values } = require("./lib/test-object-graph");

// This goes in the module loader context
//
// Define is non-side-effecting... in general.
//
// Differences with AMD-style define:
// - supports redefine to create reactive dataflow
// - supports runtime knowledge e.g. construction of dep graph
// - expanded view of what a definition can mean
// - expanded view of term namespace
// - path to RDF
// - interpreter oriented
const define = (function() {
  const definitions = {};

  function resolve(id) {
    // in what context, etc
  }

  function lookup(id) {
    // in what context, etc
  }

  return function define(term, requirements, definition) {
    const imports = requirements.map(resolve).map(lookup);
    definitions[resolve(term)] = definition(...imports);
  };
})();

// a “with” block in a hosted module is essentially an ingress
// well the whole module (or rather its eval results) are an ingress
// but the `with` block can help partition that space
// in a way that can be persisted over multiple evaluations
const use = world => {
  with (world) {
    a = b(1).c(d.f).e;
  }
};

define("a", ["b", "c"], (b, c) => b + c);

// something like the socket system
//
// the sequence produced by visitation of a thing's parts, which produces facts
define("traversed", ["input"], input => {
  // what's the input?
  // what spec to use?
});

const expression = {
  type: "apply",
  base: { type: "term", term: "plus" },
  args: [
    { type: "literal", value: 1 },
    {
      type: "apply",
      base: { type: "term", term: "times" },
      args: [
        { type: "literal", value: 3 },
        { type: "term", term: "a" },
      ],
    },
  ],
};

function* traverse_dgraph(g) {
  for (const subject of g.nodes()) {
    yield { subject, value: subject };
    for (const object of g.immediateDependencies(subject))
      yield { subject, object };
  }
}

const dg = random_dgraph(4, 4);
const facts = traverse_dgraph(dg);

const plus = (a, b) => a + b;
const times = (a, b) => a * b;
const context = {
  a: { type: "literal", value: 14 },
  plus: { type: "literal", value: plus },
  times: { type: "literal", value: times },
};
const result = si.evaluate(expression, context);
const test_function_expression = { expression, context, result };

const thing = [
  test_function_expression,
  es.with_scanner(use),
  some_ast,
  evaluate_cases.map(([[x]]) => x),
  empty_like_values,
][0];

/*
const facts = [
  { subject: 1, value: 3 },
  { subject: 4, value: 2348 },
  { subject: 1, object: 4, data: "goosebumps" },
];
*/

const not = pred => (...args) => !pred(...args);

const mark_thing = (thing, pred = () => true, attrs = { color: "red" }) => {
  const facts = [...traverse([thing], make_object_graph_traversal_spec())];
  return [
    ...dot.statements_from_traversal(facts, object_graph_dot_notation_spec),
    ...mark_nodes_matching(facts, pred, attrs),
  ];
};

exports.display = {
  dot_statements: mark_thing(expression, si.is_closed, { color: "red" }),
};
