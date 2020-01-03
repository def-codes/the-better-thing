// example cases for rules
const {
  RDFTripleStore,
  factory: rdf,
  sync_query,
  live_query,
  interpret_rules,
} = require("@def.codes/rstream-query-rdf");
const tx = require("@thi.ng/transducers");
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

const dot_node_rule = {
  name: "DotNodeRule",
  when: q("?s ?p ?o"),
  then: ({ s }) => ({
    assert: [...q("?a isa dot:Node"), [...q1("?a def:represents"), s]],
  }),
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
    rules: [dot_node_rule],
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

  const expect = tx.transduce(
    tx.map(_ => _.map(rdf.normalize)),
    tx.conj(),
    outputs
  );
  const pass = equiv(got, expect);
  return { spec, got, pass };
}

const results = cases.map(eval_test);
// const { inspect } = require("util");
// console.log(`...results`, inspect(results, { depth: 7 }));

// exports.display = { things: cases };
exports.display = { thing: results[3].got };
// exports.display = { thing: q("Sam loves Joe") };
