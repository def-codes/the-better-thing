import { equiv } from "@thi.ng/equiv";
import { evaluate } from "@def.codes/simple-interpreter";

const EVALUATE_CASES = [
  [[{ type: "literal", value: "foo" }, {}], "foo"],
  [[{ type: "term", term: "foo" }, { foo: { type: "literal", value: 3 } }], 3],
  [
    [
      { type: "access", base: { type: "term", term: "nums" }, key: "two" },
      { nums: { type: "literal", value: { one: "uno", two: "dos" } } },
    ],
    "dos",
  ],
  [
    [
      {
        type: "apply",
        base: { type: "term", term: "f" },
        args: [{ type: "term", term: "x" }],
      },
      {
        f: { type: "literal", value: n => n * n },
        x: { type: "literal", value: 5 },
      },
    ],
    25,
  ],
  [
    [
      {
        type: "apply",
        base: { type: "term", term: "f" },
        args: [
          {
            type: "apply",
            base: { type: "term", term: "g" },
            args: [{ type: "term", term: "x" }],
          },
        ],
      },
      {
        f: { type: "literal", value: n => n * n },
        g: { type: "literal", value: n => n * 2 },
        x: { type: "literal", value: 5 },
      },
    ],
    100,
  ],
] as const;

export const results = EVALUATE_CASES.map(([args, expected]) => {
  const [expr, context] = args;
  const got = evaluate(expr, context);
  const pass = equiv(expected, got);
  return { expr, context, expected, got, pass };
});

export const view = [{ field: "statements", as: "dot" }];
