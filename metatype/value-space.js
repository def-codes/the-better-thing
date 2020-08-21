const TEST_SPECS = {
  a_number: { $type: "number" },
  a_string: { $type: "string" },
  // the difference between this and a “portable” type is that this uses local
  // names.
  rgb: {
    $keys: {
      r: { $type: "number" },
      g: { $type: "number" },
      b: { $type: "number" }
    }
  },
  hsl: {
    $keys: {
      h: { $type: "number" },
      s: { $type: "number" },
      l: { $type: "number" }
    }
  },
  logic_var: {
    $keys: { var: { $type: "string" } }
  },
  logic_and: {
    $keys: {
      and: {
        $keys: { lhs: { $spec: "logic_expr" }, rhs: { $spec: "logic_expr" } }
      }
    }
  },
  logic_or: {
    $keys: {
      or: {
        $keys: { lhs: { $spec: "logic_expr" }, rhs: { $spec: "logic_expr" } }
      }
    }
  },
  logic_not: {
    $keys: {
      or: {
        $keys: { rhs: { $spec: "logic_expr" } }
      }
    }
  }
};

// Return “conformed” result for the given value against the given spec.  A
// conformance value is either a tagged version of the value (indicating by what
// path it succeeded) or an error describing a specific failure.
function conform(specs, spec, value, path = []) {
  // Intersection
  if (spec.$and) {
    let i = 0;
    for (const child_spec of spec.$and) {
      const child_result = conform(specs, child_spec, value, [...path, i++]);
      if (!child_result.pass) {
        return { fail: `missed requirement ${i}`, child_result };
      }
    }
    return { pass: true };
  }

  // Union
  if (spec.$or) {
    // should/could also be a map
    let i = 0;
    for (const child_spec of spec.$or) {
      const child_result = conform(specs, child_spec, value, [...path, i++]);
      if (child_result.pass) {
        return { pass: `met requirement ${i}`, child_result };
      }
      return { fail: `all alternatives failed` };
    }
  }

  // Referenced spec
  if (spec.$spec) {
    const alias = spec.$spec;
    const referenced_spec = specs[alias];
    if (!referenced_spec) {
      return { error: `No such spec ${alias}` };
    }
    return conform(specs, referenced_spec, value, path);
  }

  // Map (key set)
  if (spec.$keys) {
    const ret = {};
    for (const [key, child_spec] of Object.entries(spec.$keys)) {
      ret[key] = conform(specs, child_spec, value[key]);
    }
    return ret;
  }

  // Primitive type
  if (spec.$type) {
    if (typeof value === spec.$type) {
      return { pass: `yay value was a ${spec.$type}` };
    }
    return { fail: `boo value wasn't a ${spec.$type}` };
  }

  // Predicate
  if (spec.$pred) {
    const pass = spec.$pred(value);
    if (pass) return { pass };
    return { fail: `failed predicate` };
  }

  return { $error: "Unrecognized form", spec };
}

const { inspect } = require("util");
const log = (...xs) => console.log(...xs.map(x => inspect(x, { depth: 5 })));

const cheap_equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function run_test_case(test_case) {
  const { specs, spec: spec_name, value, expect } = test_case;
  const spec = specs[spec_name];
  const got = conform(specs, spec, value);
  const pass = cheap_equals(got, expect);
  return { test_case, got, pass };
}

const format_test_result = result => {
  const { test_case, got, pass } = result;
  const { spec, value, expect } = test_case;
  return pass
    ? "PASS!"
    : `FAIL! 
  expected ${JSON.stringify(expect)}
  got ${JSON.stringify(got)}
  for ${spec}
  with ${JSON.stringify(value)}
  against ${JSON.stringify(spec)}`;
};

function main(cases) {
  const results = cases.map(run_test_case);
  const reports = results.map(format_test_result);
  console.log(reports.join("\n"));
}

const TEST_CASES = [
  {
    value: { var: "x" },
    spec: "logic_var",
    expect: ["ok"]
  }
].map(x => ({ ...x, specs: TEST_SPECS }));

main(TEST_CASES);
