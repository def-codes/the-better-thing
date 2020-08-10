// Pseudocode... specs for
define(["./rdf-names"], ({ mint }) => {
  const L = mint("expressions in first-order logic");

  L.nnf = {
    seeAlso: "https://en.wikipedia.org/wiki/Negation_normal_form",
    $or: {
      // How to indicate a variable? $.variable?
      variable: { a: "Variable" },
      negation: [L.not, { a: "Variable" }],
      // Should these spec references be wrapped in {$spec}?
      conjunction: [L.and, L.nnf, L.nnf],
      disjunction: [L.or, L.nnf, L.nnf],
    },
  };

  L.cnf1 = {
    $or: {
      variable: { a: "Variable" },
      negation: [L.not, { a: "Variable" }],
      // No... this should be cnf1, right?
      disjunction: [L.or, L.nnf, L.nnf],
    },
  };

  L.cnf = {
    seeAlso: "https://en.wikipedia.org/wiki/Conjunctive_normal_form",
    $or: {
      cnf1: L.cnf1,
      conjunction: [L.and, L.cnf1, L.cnf1],
    },
  };
});
