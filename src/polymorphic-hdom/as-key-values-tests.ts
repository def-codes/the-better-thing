import { test_case } from "@def.codes/function-testing";
import { as_key_values } from "./as-key-values";

const wrapped = arg => [...as_key_values(arg)];

export const test_cases: /*readonly*/ [string, any, [any, any][]][] = [
  [
    "Array",
    [38, 4, 999, "once upon a time"],
    [[0, 38], [1, 4], [2, 999], [3, "once upon a time"]],
  ],
  [
    "Map",
    new Map([["alpha", "male"], ["beta", "blocker"]]),
    [["alpha", "male"], ["beta", "blocker"]],
  ],
  [
    "Set",
    new Set([88, true, "floof"]),
    [[null, 88], [null, true], [null, "floof"]],
  ],
  ["Object", { alpha: 3, boring: 54 }, [["alpha", 3], ["boring", 54]]],
  ["String", "hi", []],
  ["null", null, []],
];

export const AS_KEY_VALUES_TESTS = test_cases.map(([label, input, expect]) =>
  test_case(wrapped, [input], expect, label)
);
