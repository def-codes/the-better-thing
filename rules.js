// example cases for rules
const tx = require("@thi.ng/transducers");
const {
  RDFTripleStore,
  factory: rdf,
  sync_query,
  live_query,
  // interpret_rules,
} = require("@def.codes/rstream-query-rdf");
const { interpret_rules } = require("./lib/rules");
const { dot_notate } = require("./lib/dot-notate");
const { clusters_from } = require("./lib/clustering");
const { equiv } = require("@thi.ng/equiv");

// const { make_identity_factory } = require("@def.codes/rdf-data-model");
// const rdf = make_identity_factory();
const { q, q1, q11 } = require("@def.codes/meld-core");

const ISA = rdf.namedNode("isa");

const abc_triangle = q(
  "Alice spouseOf Bob",
  "Carol loves Alice",
  "Bob loves Carol"
);

const subclass_rule = {
  name: "SubclassRule",
  when: q("?s subclassOf ?c", "?x isa ?s"),
  then: ({ x, c }) => ({ assert: [[x, ISA, c]] }),
};

const symmetric_property_rule = {
  name: "SymmetricPropertyRule",
  when: q("?p isa SymmetricProperty", "?x ?p ?y"),
  then: ({ y, p, x }) => ({ assert: [[y, p, x]] }),
};

const cases = [
  {
    facts: [...abc_triangle, q1("spouseOf isa SymmetricProperty")],
    rules: [symmetric_property_rule],
    outputs: q("Bob spouseOf Alice"),
  },
  {
    facts: q("Dog isa Mammal", "Mammal subclassOf Animal"),
    rules: [subclass_rule],
    outputs: q("Dog isa Animal"),
  },
  {
    facts: [
      ...abc_triangle,
      q1("spouseOf isa SymmetricProperty"),
      ...q("Dog isa Mammal", "Mammal subclassOf Animal"),
    ],
    rules: [subclass_rule, symmetric_property_rule],
    outputs: q("Bob spouseOf Alice", "Dog isa Animal"),
  },
  {
    facts: q("Bob loves Alice", "Alice loves Carol"),
    rules: [DOT_NODE_RULE],
    outputs: q(
      "_a isa dot:Node",
      "_a def:represents Bob",
      "_b isa dot:Node",
      "_b def:represents Alice"
    ),
  },
];

function eval_test(spec) {
  const { facts, rules, outputs } = spec;
  const store = new RDFTripleStore();
  store.into(facts);

  const got = interpret_rules(store, rules);

  const expect = new Set(tx.map(_ => _.map(rdf.normalize), outputs));
  const pass = equiv(got, expect);
  return { spec, got, pass };
}

const case_number = 3;
const the_case = cases[case_number];
const { facts, rules, outputs } = the_case;
// console.log(`facts, rules, outputs`, facts, rules, outputs);
const result = eval_test(the_case);
const gen = [...result.got];

const dot_statements = clusters_from({
  facts: dot_notate(facts, "blue").dot_statements,
  got: dot_notate(gen, "red").dot_statements,
  outputs: dot_notate(outputs, "purple").dot_statements,
}).map(_ => ({ ..._, attributes: { label: _.id.slice("cluster ".length) } }));

exports.display = {
  dot_graph: {
    directed: true,
    attributes: {
      // label: case_name,
      // splines: false,
      rankdir: "LR",
      // layout: "circo",
    },
    statements: dot_statements,
  },
};
