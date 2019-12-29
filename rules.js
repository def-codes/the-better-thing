// example cases for rules

const { make_identity_factory } = require("@def.codes/rdf-data-model");
const rdf = make_identity_factory();

const ISA = rdf.namedNode("isa");

const q = (...clauses /*: string[]*/) =>
  clauses.map(clause =>
    clause.split(/\s+/).map(term =>
      term.startsWith("?")
        ? rdf.variable(term.slice(1))
        : // Clever but didn't end up getting used
        term.startsWith('"') && term.endsWith('"')
        ? rdf.literal(term.slice(1, -1))
        : rdf.namedNode(term)
    )
  );

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
    facts: [...abc_triangle],
    rules: [symmetric_property_rule],
    outputs: [q("Bob spouseOf Alice")],
  },
  {
    facts: q("Dog isa Mammal", "Mammal subclassOf Animal"),
    rules: [subclass_rule],
    outputs: q("Dog isa Animal"),
  },
];

exports.display = { things: cases };
