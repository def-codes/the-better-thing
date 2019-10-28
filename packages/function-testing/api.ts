import { ArrayDiff, ObjectDiff } from "@thi.ng/diff";

export interface PureFunctionTestCase<
  A extends readonly any[] = readonly any[],
  O = any
> {
  "@type": "test$FunctionTestCase";
  test$function: (...args: A) => O;
  test$arguments: A;
  test$expect: O;
}

export interface PureFunctionTestResult<
  A extends readonly any[] = readonly any[],
  O = any
> {
  test$case: PureFunctionTestCase<A, O>;
  test$got?: any;
  test$diff?: ArrayDiff<any> | ObjectDiff<any> | null;
  test$passed: boolean;
  test$error?: Error; // should be datafied
}
