// Pseudocode for defining some common logical equivalences
//
// Can be seen as bidirectional rewrite rules
//
// As rewrite rules, they are like epsilon moves (no change)
//
// A rule says these two forms mean exactly the same thing
//
// and can always be substituted according to the pattern with no change in meaning
//
// Written here using a prefix notation with tuples for expression
define(["./rdf-names"], ({ mint }) => {
  const L = mint("http://def.codes/unk/logic expressions in first-order logic");
  const $ = mint("variable expression");

  // These are each themselves well-known things
  const logic_rewrite_rules = {
    // This is essentially the definition of implies
    implies: {
      [L.equivalent]: [
        [L.implies, $.a, $.b],
        [L.or, [L.not, $.a], $.b],
      ],
    },
    double_negation: {
      [L.equivalent]: [[L.not, [L.not, $.x]], $.x],
    },
    distribute_and: {
      [L.equivalent]: [
        [L.and, $.a, [L.or, $.b, $.c]],
        [L.or, [L.and, $.a, $.b], [L.and, $.a, $.c]],
      ],
    },
    distribute_or: {
      [L.equivalent]: [
        [L.or, $.a, [L.and, $.b, $.c]],
        [L.and, [L.or, $.a, $.b], [L.or, $.a, $.c]],
      ],
    },
    de_morgan1: {
      [L.equivalent]: [
        [L.not, [L.or, $.a, $.b]],
        [L.and, [L.not, $.a], [L.not, $.b]],
      ],
    },
    de_morgan2: {
      [L.equivalent]: [
        [L.not, [L.and, $.a, $.b]],
        [L.or, [L.not, $.a], [L.not, $.b]],
      ],
    },
  };
});
