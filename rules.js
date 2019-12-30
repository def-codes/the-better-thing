// example cases for rules
const {
  RDFTripleStore,
  factory: rdf,
  sync_query,
  live_query,
} = require("@def.codes/rstream-query-rdf");
const { equiv } = require("@thi.ng/equiv");

// const { make_identity_factory } = require("@def.codes/rdf-data-model");
// const rdf = make_identity_factory();
const { q, q1 } = require("@def.codes/meld-core");

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
    outputs: [q("Bob spouseOf Alice")],
  },
  {
    facts: q("Dog isa Mammal", "Mammal subclassOf Animal"),
    rules: [subclass_rule],
    outputs: q("Dog isa Animal"),
  },
];

function eval_test(spec) {
  const { facts, rules, outputs } = spec;
  const store = new RDFTripleStore();
  store.into(facts);
  // console.log(`store.triples`, store.triples);

  // ASSUME 1 rule for now
  const [rule] = rules;
  const { when, then } = rule;
  const matched = sync_query(store, when);
  const got = new Set(Array.from(matched, then).map(_ => _.assert));
  const pass = equiv(got, new Set(outputs));
  return { spec, got, pass };
}

const results = cases.map(eval_test);
console.log(`...results`, ...results);

exports.display = { things: cases };
// exports.display = { thing: q("Sam loves Joe") };
