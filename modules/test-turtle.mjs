import { with_scanner } from "./expression-scanner.mjs";
import { serialize } from "./expression-serializer.mjs";

import { expecting_statements } from "./turtle2.mjs";

// for node
import { createRequireFromPath } from "module";
const require = createRequireFromPath(import.meta.url);
const { inspect } = require("util");

const TEST_CASES = [
  [_ => _.a.Poet, [[{ term: { minted: 0 } }, { term: "a" }, { term: "Poet" }]]],
  [
    _ => [_.a.Prince, _.a.Pauper],
    [
      [{ term: { minted: 0 } }, { term: "a" }, { term: "Prince" }],
      [{ term: { minted: 1 } }, { term: "a" }, { term: "Pauper" }]
    ]
  ],
  [
    _ => _.Alice.knows.Bob,
    [[{ term: "Alice" }, { term: "knows" }, { term: "Bob" }]]
  ],
  [_ => _.Alice.knows.Bob.Barker, undefined],
  [
    _ => [_.Alice.knows.Bob, _.Alice.knows.Carol],
    [
      [{ term: "Alice" }, { term: "knows" }, { term: "Bob" }],
      [{ term: "Alice" }, { term: "knows" }, { term: "Carol" }]
    ]
  ],
  [
    _ => _.Alice.knows(_.Bob, _.Carol),
    [
      [{ term: "Alice" }, { term: "knows" }, { term: "Bob" }],
      [{ term: "Alice" }, { term: "knows" }, { term: "Carol" }]
    ]
  ],
  [
    _ => _.Alice(_.likes.Bob, _.loves.Carol),
    [
      [{ term: "Alice" }, { term: "likes" }, { term: "Bob" }],
      [{ term: "Alice" }, { term: "loves" }, { term: "Carol" }]
    ]
  ],
  [
    _ => _.Alice.age(95),
    [[{ term: "Alice" }, { term: "age" }, { literal: 95 }]]
  ],
  [
    _ => _.Alice.alias("Ali", "Alicia"),
    [
      [{ term: "Alice" }, { term: "alias" }, { literal: "Ali" }],
      [{ term: "Alice" }, { term: "alias" }, { literal: "Alicia" }]
    ]
  ],
  [
    _ => _.Alice(_.likes(_.Bob, _.Dave), _.loves.Carol),
    [
      [{ term: "Alice" }, { term: "likes" }, { term: "Bob" }],
      [{ term: "Alice" }, { term: "likes" }, { term: "Dave" }],
      [{ term: "Alice" }, { term: "loves" }, { term: "Carol" }]
    ]
  ],
  [
    _ => _.Alice(_.likes(_.Bob, _.a.Scientist), _.loves.Carol),
    [
      [{ term: "Alice" }, { term: "likes" }, { term: "Bob" }],
      [{ term: "Alice" }, { term: "likes" }, { term: { minted: 0 } }],
      [{ term: { minted: 0 } }, { term: "a" }, { term: "Scientist" }],
      [{ term: "Alice" }, { term: "loves" }, { term: "Carol" }]
    ]
  ],
  [
    _ => _.Alice(_.likes(_.a.Poet, _.a.Preacher), _.loves.Carol),
    [
      [{ term: "Alice" }, { term: "likes" }, { term: { minted: 0 } }],
      [{ term: { minted: 0 } }, { term: "a" }, { term: "Poet" }],
      [{ term: "Alice" }, { term: "likes" }, { term: { minted: 1 } }],
      [{ term: { minted: 1 } }, { term: "a" }, { term: "Preacher" }],
      [{ term: "Alice" }, { term: "loves" }, { term: "Carol" }]
    ]
  ],
  [
    _ => _.Alice(_.likes(_.a(_.Poet, _.Preacher)), _.loves.Carol),
    [
      [{ term: "Alice" }, { term: "likes" }, { term: { minted: 0 } }],
      [{ term: { minted: 0 } }, { term: "a" }, { term: "Poet" }],
      [{ term: { minted: 0 } }, { term: "a" }, { term: "Preacher" }],
      [{ term: "Alice" }, { term: "loves" }, { term: "Carol" }]
    ]
  ]
];

function test() {
  for (const [fn, expect] of TEST_CASES) {
    let exprs,
      scanner_error,
      expander_error,
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

    console.log(`===`, expressions.join(", "));

    try {
      expansion = [...expecting_statements(exprs)];
    } catch (error) {
      console.log("ERROR expanding: ", error);
    }

    const expected_json = JSON.stringify(expect);
    const got_json = JSON.stringify(expansion);
    if (expected_json === got_json) {
      console.log("PASS!");
      // console.log(`expected_json`, expected_json);
      // console.log(`got_json`, got_json);
    } else {
      console.log(`FAIL! expected`, inspect(expect, { depth: null }));
      console.log(`exprs`, inspect(exprs, { depth: null }));
      console.log(`expansion`, inspect(expansion, { depth: null }));
      console.log(`expected_json`, expected_json);
      console.log(`got_json`, got_json);
    }
  }
}

test();
