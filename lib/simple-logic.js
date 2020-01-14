const constructors = {
  not: rhs => ({ type: "not", rhs }),
  and: (lhs, rhs) => ({ type: "and", lhs, rhs }),
  or: (lhs, rhs) => ({ type: "or", lhs, rhs }),
  implies: (lhs, rhs) => ({ type: "implies", lhs, rhs }),
  variable: name => ({ type: "variable", name }),
};
const { not, and, or, implies, variable } = constructors;

const is_compound = expr => expr.lhs && expr.rhs;

// maybe parenthesize
const mp = (say, expr) => (is_compound(expr) ? `(${say(expr)})` : say(expr));

const math_notation = {
  not: (_, say) => `¬${mp(say, _.rhs)}`,
  and: (_, say) => `${mp(say, _.lhs)}∧${mp(say, _.rhs)}`,
  or: (_, say) => `${mp(say, _.lhs)}∨${mp(say, _.rhs)}`,
  implies: (_, say) => `${mp(say, _.lhs)}→${mp(say, _.rhs)}`,
  variable: _ => _.name,
};

const ascii_math_notation = {
  not: (_, say) => `~${mp(say, _.rhs)}`,
  and: (_, say) => `${mp(say, _.lhs)} & ${mp(say, _.rhs)}`,
  or: (_, say) => `${mp(say, _.lhs)} | ${mp(say, _.rhs)}`,
  implies: (_, say) => `${mp(say, _.lhs)} -> ${mp(say, _.rhs)}`,
  variable: _ => _.name,
};

const make_notate = notation =>
  function say(expr) {
    const fn = notation[expr.type];
    if (!fn) throw `unrecognized expression type: ${expr.type}`;
    return fn(expr, say);
  };

// these are all bidirectional.  how to apply symbolically?
// need more general pattern match
const transformations = {
  implies: _ => (_.type === "implies" ? or(not(_.lhs), _.rhs) : _),
  double_negation: _ =>
    _.type === "not" && _.rhs.type === "not" ? _.rhs.rhs : _,
  distribute: _ =>
    _.type === "and" && _.rhs.type === "or"
      ? or(and(_.lhs, _.rhs.lhs), and(_.lhs, _.rhs.rhs))
      : _.type === "or" && _.rhs.type === "and"
      ? and(or(_.lhs, _.rhs.lhs), or(_.lhs, _.rhs.rhs))
      : _,
  de_morgan: _ =>
    _.type === "not" && _.rhs.type === "or"
      ? and(not(_.rhs.lhs), not(_.rhs.rhs))
      : _.type === "not" && _.rhs.type === "and"
      ? or(not(_.rhs.lhs), not(_.rhs.rhs))
      : _,
};

// hmm, this is a b-tree
function* iterate_nodes(expr) {
  yield expr;
  if (expr.lhs) yield* iterate_nodes(expr.lhs);
  if (expr.rhs) yield* iterate_nodes(expr.rhs);
}

// use transducers
const variables_in = expr =>
  new Set(
    [...iterate_nodes(expr)].filter(_ => _.type === "variable").map(_ => _.name)
  );

const is_literal = expr =>
  expr.type === "variable" ||
  (expr.type === "not" && expr.rhs.type === "variable");

// negation normal form
function nnf(expr) {
  if (expr.type === "implies") return or(nnf(not(expr.lhs)), nnf(expr.rhs));

  if (expr.type === "not") {
    switch (expr.rhs.type) {
      case "not":
        return nnf(expr.rhs.rhs);
      case "and":
        return or(nnf(not(expr.rhs.lhs)), nnf(not(expr.rhs.rhs)));
      case "or":
        return and(nnf(not(expr.rhs.lhs)), nnf(not(expr.rhs.rhs)));
      case "variable":
        return expr;
    }

    // should be implies now
    return nnf({ ...expr, rhs: nnf(expr.rhs) });
  }
  if (expr.type === "variable") return expr;

  return { ...expr, lhs: nnf(expr.lhs), rhs: nnf(expr.rhs) };
}
// const negation_normalize = nnf;

// working on a better approach to CNF...

// assumes input is already in nnf
function cnf1(expr) {
  const _ = expr;
  if (_.type === "or") {
    if (_.lhs.type === "and")
      return and(cnf1(or(_.rhs, _.lhs.rhs)), or(_.rhs, _.lhs.lhs));
    if (_.rhs.type === "and")
      return and(cnf1(or(_.lhs, _.rhs.lhs)), or(_.lhs, _.rhs.rhs));
    if (_.lhs.type === "or") return or(cnf1(_.lhs), cnf1(_.rhs));
    if (_.rhs.type === "or") return or(cnf1(_.lhs), cnf1(_.rhs));
  }

  if (_.type === "and") return and(cnf1(_.lhs), cnf1(_.rhs));

  return expr;
}

const cnf = expr => {
  let i = 0;
  const neg_norm = nnf(expr);
  let cand = neg_norm;
  while (!is_cnf(cand)) {
    cand = cnf1(cand);
    if (i++ > 45) {
      console.warn(
        `too much recursion normalizing \n\n`,
        ascii_notate(expr),
        "\n\n",
        ascii_notate(cand),
        "\n\n"
      );
      break;
    }
  }
  return cand;
};

const COMMUTATIVE = { and: true, or: true };

function* flatten_commutative(expr, op) {
  if (expr.type !== op) yield expr;
  else {
    yield* flatten_commutative(expr.lhs, op);
    yield* flatten_commutative(expr.rhs, op);
  }
}

const is_cnf_clause = expr =>
  [...flatten_commutative(expr, "or")].every(is_literal);

const is_cnf = expr =>
  [...flatten_commutative(expr, "and")].every(is_cnf_clause);

const maybe_flatten = expr =>
  COMMUTATIVE[expr.type]
    ? [expr.type, [...flatten_commutative(expr, expr.type)]]
    : [undefined, []];

const notate = make_notate(math_notation);
const ascii_notate = make_notate(ascii_math_notation);

// create a conjunction of all given expressions
const sat_prep = expressions => {
  const conjunction = expressions.reduce(and);
  const normalized = cnf(conjunction);
  const variables = [...new Set(variables_in(normalized))];

  // convert conjoined clauses back to an array
  const cnf_clauses = [...flatten_commutative(normalized, "and")];
  console.log(`cnf_clauses.map(ascii_notate)`, cnf_clauses.map(ascii_notate));

  const clauses = cnf_clauses.map(clause =>
    Array.from(flatten_commutative(clause, "or"), _ =>
      _.type === "not"
        ? { variable: _.rhs.name, neg: true }
        : { variable: _.name }
    )
  );

  return { variables, clauses };
};

function* choose2(items) {
  for (let i = 0; i < items.length - 1; i++)
    for (let j = i + 1; j < items.length; j++) yield [items[i], items[j]];
}

// return a set of clauses constraining to solutions where exactly one of the
// terms is true.  What's given, variable expr's, or names?  Or expr's generally?
const exactly_one = exprs =>
  exprs.length === 0
    ? []
    : [
        exprs.reduce(or),
        ...[...choose2(exprs)].map(([a, b]) => or(not(a), not(b))),
      ];

module.exports = {
  cnf,
  constructors,
  notate,
  ascii_notate,
  transformations,
  variables_in,
  flatten_commutative,
  sat_prep,
  exactly_one,
};
