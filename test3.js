const { equiv } = require("@thi.ng/equiv");
const { run_test } = require("@def.codes/function-testing");
const { TEST_CASES } = require("@def.codes/rdf-expressions-test");
const { AS_KEY_VALUES_TESTS } = require("@def.codes/polymorphic-hdom");
const { inspect } = require("util");

console.log(`equiv(undefined, undefined)`, equiv(undefined, undefined));

const results = [...TEST_CASES, ...AS_KEY_VALUES_TESTS].map(run_test);

const format_result = result => {
  if (result.test$passed) return `PASS ${result.test$case.label}`;
  return `FAIL ${result.test$case.label}
expected ${inspect(result.test$case.test$expect, { depth: 10 })}
     got ${inspect(result.test$got, { depth: 10 })}
    diff ${inspect(result.test$diff, { depth: 10 })}`;
};

const formatted = results.map(format_result).join("\n");
console.log(formatted);
