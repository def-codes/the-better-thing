import { equivObject } from "@thi.ng/equiv";
import { evaluate, Expression } from "@def.codes/simple-interpreter";

type Context = Record<string, Expression>;

/*
function f(x) {
  return { box: x };
}

function g(x) {
  return { box: { ...x } };
}

function make_case(input, fn) {
  const output = fn(input);
  return { input, output, fn };
}

export const case1 = make_case({ term: "hello" }, f);
export const case2 = make_case({ term: "world" }, g);
*/

const expand = (expression: Expression, context: Context): Expression => {
  // if (expression.type === "access") return { ...expression };
  if (expression.type === "term") return context[expression.term];
  return expression;
};

const EXPAND_CASES = [
  [
    [{ type: "term", term: "foo" }, { foo: { type: "literal", value: 3 } }],
    { type: "literal", value: 3 },
  ],
  //   [[{ apply: [{ term: "x" }], to: { term: "f" } }, { foo: { literal: 3 } }], { literal: 3 }],
] as const;

export const results = EXPAND_CASES.map(([args, expected]) => {
  const [expr, context] = args;
  const got = expand(expr, context);
  const pass = equivObject(expected, got);
  return { expr, context, expected, got, pass };
});
