const es = require("@def.codes/expression-reader");
const { some_ast } = require("./lib/some-ast");
const { evaluate_cases } = require("./lib/evaluate-cases");

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

const thing = [
  es.with_scanner(use),
  some_ast,
  evaluate_cases.map(([[x]]) => x),
  {
    bits: [0, 0, 0, 0, 1, 0],
    array_of_falsy: [false, 0, "", null, undefined],
    null: null,
    undefined: undefined,
    one: 1,
    zero: 0,
    blank_string: "",
    false: false,
    true: true,
  }
][2];

exports.display = { thing };
