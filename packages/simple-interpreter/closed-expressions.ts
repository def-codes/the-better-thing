import { assert_unreachable } from "@def.codes/helpers";
import { Expression, ClosedExpression, Context } from "./api";

// These functions are unused but may be part of separating eval into two passes
// (symbol (term) resolution and evaluation).

// Tell whether an expression can be evaluated now without a context.
export const is_closed = (
  expression: Expression
): expression is ClosedExpression => {
  if (expression.type === "literal") return true;

  if (expression.type === "access") return is_closed(expression.base);

  if (expression.type === "apply")
    return is_closed(expression.base) && expression.args.every(is_closed);

  return false;
};

// Resolve all terms in an expression against a given context.
export const close = (
  expression: Expression,
  context: Context
): ClosedExpression => {
  if (expression.type === "literal") return expression;

  if (expression.type === "term")
    return close(context[expression.term], context);

  if (expression.type === "access")
    return { ...expression, base: close(expression.base, context) };

  if (expression.type === "apply")
    return {
      ...expression,
      base: close(expression.base, context),
      args: expression.args.map(arg => close(arg, context)),
    };

  return assert_unreachable(expression, "expression");
};

export const evaluate_closed = (expression: ClosedExpression): any => {
  if (expression.type === "literal") return expression.value;

  if (expression.type === "access")
    return evaluate_closed(expression.base)[expression.key];

  if (expression.type === "apply")
    return evaluate_closed(expression.base)(
      ...expression.args.map(evaluate_closed)
    );

  return assert_unreachable(expression, "closed expression");
};
