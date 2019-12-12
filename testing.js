const es = require("@def.codes/expression-reader");
const { some_ast } = require("./lib/some-ast");
const { evaluate_cases } = require("./lib/evaluate-cases");

// a “with” block in a hosted module is essentially an ingress
// well the whole module (or rather its eval results) are an ingress
// but the `with` block can help partition that space
// in a way that can be persisted over multiple evaluations
const use = world => {
  with (world) {
    a = b(1).c(d.f).e;
  }
};

const thing = [
  es.with_scanner(use),
  some_ast,
  evaluate_cases.map(([[x]]) => x),
][2];

exports.display = { thing };
