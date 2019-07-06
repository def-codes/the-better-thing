import { with_scanner, serialize } from "@def.codes/expression-reader";
import { expecting_statements } from "@def.codes/rdf-expressions";

const inspect = (...args) => args.map(x => JSON.stringify(x)).join("\n");
const TEST_CASES = [["nam", () => {}, 0]];

export function run_tests() {
  for (const [name, fn, expect] of TEST_CASES) {
    let exprs,
      expander_error: Error | undefined,
      expansion,
      expressions = [];
    try {
      exprs = with_scanner(fn);
    } catch (error) {
      console.log("ERROR scanning: ", error);
      continue;
    }

    for (const expr of exprs)
      try {
        expressions.push(serialize(expr));
      } catch (error) {
        console.log("ERROR serializing: ", expr, error);
      }

    console.log(`===`, name);
    console.log(`---`, expressions.join(", "));

    try {
      expansion = [...expecting_statements(exprs)];
    } catch (error) {
      expander_error = error;
    }

    const expected_json = JSON.stringify(expect);
    const got_json = JSON.stringify(expansion);
    if (expected_json === got_json) {
      console.log("PASS!");
      // console.log(`expected_json`, expected_json);
      // console.log(`got_json`, got_json);
    } else {
      console.log(`FAIL! expected`, inspect(expect, { depth: null }));
      if (expander_error) console.log(`expander_error`, expander_error);
      console.log(`exprs`, inspect(exprs, { depth: null }));
      console.log(`expansion`, inspect(expansion, { depth: null }));
      console.log(`expected_json\n`, expected_json);
      console.log(`got_json\n`, got_json);
    }
  }
}
