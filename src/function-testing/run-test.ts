import { isObject } from "@thi.ng/checks";
import { equiv } from "@thi.ng/equiv";
import { diffArray, diffObject } from "@thi.ng/diff";
import { PureFunctionTestCase, PureFunctionTestResult } from "./api";

export const run_test = <A extends [], O>(
  test$case: PureFunctionTestCase<A, O>
): PureFunctionTestResult<A, O> => {
  try {
    const got: any = test$case.test$function(...test$case.test$arguments);
    const expected: any = test$case.test$expect;
    const equal = equiv(got, expected);
    let test$diff = null;
    if (!equal) {
      if (Array.isArray(got) && Array.isArray(expected))
        test$diff = diffArray(got, expected);
      else if (isObject(got) && isObject(expected))
        test$diff = diffObject(got, expected);
    }

    return {
      test$case,
      test$got: got,
      test$passed: equal,
      test$diff
    };
  } catch (test$error) {
    return { test$case, test$error, test$passed: false };
  }
};
