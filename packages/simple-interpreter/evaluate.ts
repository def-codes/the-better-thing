import { assert_unreachable } from "@def.codes/helpers";
import { Expression, Context } from "./api";

// TBD: iterative (stepwise) evaluate where you can see intermediate values, etc

export const evaluate = (expression: Expression, context: Context): any => {
  if (expression.type === "literal") return expression.value;

  if (expression.type === "term")
    return evaluate(context[expression.term], context);

  if (expression.type === "access")
    return evaluate(expression.base, context)[expression.key];

  if (expression.type === "apply")
    return evaluate(
      expression.base,
      context
    )(...expression.args.map(arg => evaluate(arg, context)));

  return assert_unreachable(expression, "expression");
};
