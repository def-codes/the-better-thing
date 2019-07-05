import { PureFunctionTestCase } from "./api";

export const test_case = <A extends any[], O>(
  fn: (...args: A) => O,
  args: A,
  output: O,
  label?: string
): PureFunctionTestCase<A, O> => ({
  "@type": "test$FunctionTestCase",
  ...(label ? { label } : {}),
  test$function: fn,
  test$arguments: args,
  test$expect: output
});
