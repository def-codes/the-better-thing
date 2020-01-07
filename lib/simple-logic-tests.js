const {
  constructors,
  notate,
  transformations,
  cnf,
  flatten_commutative,
} = require("./simple-logic");

const { not, and, or, implies, variable } = constructors;

// shorthands for tests, perhaps not generally good
const v = variable;
const vars = letters => Array.from(letters, variable);
const ors = exprs => exprs.reduce(or);
const ands = exprs => exprs.reduce(and);

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

  v("p"),
  and(v("p"), v("q")),
  or(v("p"), v("q")),
  and(or(v("p"), v("q")), v("r")),
  ands(vars("pqr")),
  ors(vars("pqr")),
  ands(vars("pqrs")),
  ors(vars("pqrs")),
  and(ands(vars("pq")), ands(vars("rs"))),
  or(ors(vars("pq")), ors(vars("rs"))),
  or(and(v("p"), v("q")), v("r")),
  or(and(v("p"), v("q")), and(v("r"), v("s"))),
  and(or(v("p"), v("q")), or(v("r"), v("s"))),
  and(and(v("p"), v("q")), or(v("r"), v("s"))),
  implies(v("p"), v("q")),
  implies(and(v("p"), v("q")), not(v("r"))),
  not(and(v("p"), v("q"))),
  not(or(v("p"), not(v("q")))),
  or(and(v("p"), v("q")), and(or(v("r"), v("p")), and(v("q"), v("t")))),
  not(not(v("p"))),
  and(or(implies(v("p"), v("q")), v("x")), not(v("y"))),
  and(or(v("x"), implies(v("p"), v("q"))), not(v("y"))),
  and(not(implies(v("p"), v("q"))), not(v("y"))),
  and(not(implies(v("p"), not(not(v("q"))))), not(v("y"))),
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
for (const expr of expressions) {
  console.log(
    notate(expr),
    // "vars",
    // variables_in(expr),
    // "NNF",
    // notate(nnf(expr)),
    // "   FLAT   ",
    // (function() {
    //   const [op, items] = maybe_flatten(expr);
    //   return items.map(notate).join(` ${op} `);
    // })(),
    // "   CNF   ",
    // notate(cnf(expr)),
    "  CNF FLAT   ",
    [...flatten_commutative(cnf(expr), "and")]
      .map(_ => `(${notate(_)})`)
      .join(" & ")
  );
}
// expressions.map(notate).join("\n");
// console.log(inspect(expressions, { depth: 4 }));
