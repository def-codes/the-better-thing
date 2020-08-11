/*
  Pseudocode... specs for standard logical normal forms.

  Can the `$spec` references be implicit?  i.e. can you just recognize the spec
  by value or context?
 */
define(["./rdf-names"], ({ mint }) => {
  const L = mint("expressions in first-order logic");

  L.nnf = {
    seeAlso: "https://en.wikipedia.org/wiki/Negation_normal_form",
    $or: {
      // How to indicate a variable? $.variable?
      variable: { a: "Variable" },
      negation: [L.not, { a: "Variable" }],
      conjunction: [L.and, { $spec: L.nnf }, { $spec: L.nnf }],
      disjunction: [L.or, { $spec: L.nnf }, { $spec: L.nnf }],
    },
  };

  L.cnf1 = {
    $or: {
      variable: { a: "Variable" },
      negation: [L.not, { a: "Variable" }],
      // No... this should be cnf1, right?
      disjunction: [L.or, { $spec: L.nnf }, { $spec: L.nnf }],
    },
  };

  L.cnf = {
    seeAlso: "https://en.wikipedia.org/wiki/Conjunctive_normal_form",
    $or: {
      cnf1: L.cnf1,
      conjunction: [L.and, { $spec: L.cnf1 }, { $spec: L.cnf1 }],
    },
  };
});
