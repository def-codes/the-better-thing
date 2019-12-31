// example cases for rules
const {
  RDFTripleStore,
  factory: rdf,
  sync_query,
  live_query,
} = require("@def.codes/rstream-query-rdf");
const tx = require("@thi.ng/transducers");
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
    outputs: q("Bob spouseOf Alice"),
  },
  {
    facts: q("Dog isa Mammal", "Mammal subclassOf Animal"),
    rules: [subclass_rule],
    outputs: q("Dog isa Animal"),
  },
];

// compute the results (assertions) of the given rule on the given store
const apply_rule = (store, { when, then }) =>
  tx.transduce(
    tx.mapcat(_ => then(_).assert),
    tx.conj(),
    sync_query(store, when) || []
  );

function eval_test(spec) {
  const { facts, rules, outputs } = spec;
  const store = new RDFTripleStore();
  store.into(facts);
  // console.log(`store.triples`, store.triples);

  // ASSUME 1 rule for now
  const [rule] = rules;
  const got = apply_rule(store, rule);
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
exports.display = { things: results };
// exports.display = { thing: q("Sam loves Joe") };
