const constructors = {
  not: rhs => ({ type: "not", rhs }),
  and: (lhs, rhs) => ({ type: "and", lhs, rhs }),
  or: (lhs, rhs) => ({ type: "or", lhs, rhs }),
  implies: (lhs, rhs) => ({ type: "implies", lhs, rhs }),
  variable: name => ({ type: "variable", name }),
};

const math_notation = {
  not: (_, say) => `¬(${say(_.rhs)})`,
  and: (_, say) => `(${say(_.lhs)})∧(${say(_.rhs)})`,
  or: (_, say) => `(${say(_.lhs)})∨(${say(_.rhs)})`,
  implies: (_, say) => `${say(_.lhs)}→${say(_.rhs)}`,
  variable: _ => _.name,
};

const make_notate = notation =>
  function say(expr) {
    const fn = notation[expr.type];
    if (!fn) throw `unrecognized expression type: ${expr.type}`;
    return fn(expr, say);
  };

const { not, and, or, implies, variable } = constructors;

// these are all bidirectional.  how to apply symbolically?
// need more general pattern match
const transformations = {
  implies: _ => (_.type === "implies" ? or(not(_.rhs), _.lhs) : _),
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

const notate = make_notate(math_notation);

module.exports = { constructors, notate, transformations };
