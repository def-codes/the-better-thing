import { assert_unreachable } from "@def.codes/helpers";
import { Expression, ClosedExpression, Context } from "./api";

// These functions are unused but may be part of separating eval into two passes
// (symbol (term) resolution and evaluation).

// Tell whether an expression can be evaluated now without a context.
const is_closed = (expression: Expression): expression is ClosedExpression => {
  if (expression.type === "literal") return true;

  if (expression.type === "access") return is_closed(expression.base);

  if (expression.type === "apply")
    return is_closed(expression.base) && expression.args.every(is_closed);

  return false;
};

const evaluate_closed = (expression: ClosedExpression): any => {
  if (expression.type === "literal") return expression.value;

  if (expression.type === "access")
    return evaluate_closed(expression.base)[expression.key];

  if (expression.type === "apply")
    return evaluate_closed(expression.base)(
      ...expression.args.map(evaluate_closed)
    );

  return assert_unreachable(expression, "closed expression");
};
