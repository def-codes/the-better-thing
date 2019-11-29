import { Expression, Context } from "./api";

// Fancier, more declarative way that doesn't type as well

// Why isn't this the same as Expression & { type: K }
export type ExpressionOf<
  K extends T["type"],
  T extends { type: string } = Expression
> = T extends { type: K } ? T : never;

const EVALS: {
  [K in Expression["type"]]: (expr: ExpressionOf<K>, context: Context) => any;
} = {
  literal: expr => expr.value,
  term: (expr, context) => evaluate(context[expr.term], context),
  access: (expr, context) => evaluate(expr, context)[expr.key],
  apply: (expr, context) =>
    evaluate(expr.fn, context)(...expr.args.map(arg => evaluate(arg, context))),
};

export const evaluate = (expression: Expression, context: Context): any =>
  // @ts-ignore: TS can't narrow expression to corresponding subtype
  EVALS[expression.type](expression, context);
