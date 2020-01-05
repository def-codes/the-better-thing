const { constructors, notate, transformations } = require("./simple-logic");

const { not, and, or, implies, variable } = constructors;

const implies1 = implies(variable("p"), variable("q"));
const doubleneg1 = not(not(variable("p")));
const dist_or = and(variable("p"), or(variable("q"), variable("r")));
const dist_and = or(variable("p"), and(variable("q"), variable("r")));
const demorgan1 = not(or(variable("p"), variable("q")));
const demorgan2 = not(and(variable("p"), variable("q")));

const expressions = [
  // longhand
  /*
  {
    type: "and",
    lhs: {
      type: "or",
      lhs: {
        type: "implies",
        lhs: { type: "variable", name: "p" },
        rhs: { type: "variable", name: "q" }
      },
      rhs: { type: "variable", name: "x" }
    },
    rhs: { type: "not", rhs: { type: "variable", name: "y" } }
  },
  */
  // shorthand
  and(
    or(implies(variable("p"), variable("q")), variable("x")),
    not(variable("y"))
  ),
  implies1,
  transformations.implies(implies1),
  doubleneg1,
  transformations.double_negation(doubleneg1),
  dist_or,
  transformations.distribute(dist_or),
  dist_and,
  transformations.distribute(dist_and),
  demorgan1,
  transformations.de_morgan(demorgan1),
  demorgan2,
  transformations.de_morgan(demorgan2),
];

const { inspect } = require("util");
expressions.map(notate);
console.log(inspect(expressions, { depth: 4 }));
