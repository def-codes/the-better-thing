import { assert_unreachable } from "@def.codes/helpers";
import { Expression, Context } from "./api";

// Is there a place for a function that just fills out & doesn't actually evaluate?
// Or maybe an iterative (stepwise) evaluate?
// In which you can see intermediate values, etc

export const evaluate = (expression: Expression, context: Context): any => {
  if (expression.type === "literal") return expression.value;

  if (expression.type === "term")
    return evaluate(context[expression.term], context);

  if (expression.type === "access")
    return evaluate(expression.base, context)[expression.key];

  if (expression.type === "apply")
    return evaluate(
      expression.fn,
      context
    )(...expression.args.map(arg => evaluate(arg, context)));

  return assert_unreachable(expression, "expression");
};
