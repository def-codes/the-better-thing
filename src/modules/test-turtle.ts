import { with_scanner } from "./expression-scanner";
import { serialize } from "./expression-serializer";

import { expecting_statements } from "./turtle-expand";

// for node
import { createRequireFromPath } from "module";
const require = createRequireFromPath(import.meta.url);
const { inspect } = require("util");

const TEST_CASES = [
  [
    "Simple triple",
    _ => _.Alice.knows.Bob,
    [[{ term: "Alice" }, { term: "knows" }, { term: "Bob" }]]
  ],

  [
    "Standalone blank node",
    _ => _.a.Poet,
    [[{ term: { minted: 0 } }, { term: "a" }, { term: "Poet" }]]
  ],

  ["Invalid: sequence too long", _ => _.Alice.knows.Bob.Barker, undefined],

  [
    "Multiple simple triples",
    _ => [_.Alice.knows.Bob, _.Alice.knows.Carol],
    [
      [{ term: "Alice" }, { term: "knows" }, { term: "Bob" }],
      [{ term: "Alice" }, { term: "knows" }, { term: "Carol" }]
    ]
  ],

  [
    "Multiple standalone blank nodes",
    _ => [_.a.Prince, _.a.Pauper],
    [
      [{ term: { minted: 0 } }, { term: "a" }, { term: "Prince" }],
      [{ term: { minted: 1 } }, { term: "a" }, { term: "Pauper" }]
    ]
  ],

  [
    "Subject-predicate expands over object list",
    _ => _.Alice.knows(_.Bob, _.Carol),
    [
      [{ term: "Alice" }, { term: "knows" }, { term: "Bob" }],
      [{ term: "Alice" }, { term: "knows" }, { term: "Carol" }]
    ]
  ],

  [
    "Subject expands over predicate-object list",
    _ => _.Alice(_.likes.Bob, _.loves.Carol),
    [
      [{ term: "Alice" }, { term: "likes" }, { term: "Bob" }],
      [{ term: "Alice" }, { term: "loves" }, { term: "Carol" }]
    ]
  ],

  [
    "Literal object value: number",
    _ => _.Alice.age(95),
    [[{ term: "Alice" }, { term: "age" }, { literal: 95 }]]
  ],

  [
    "Literal object value: string",
    _ => _.Alice.alias("Persephone"),
    [[{ term: "Alice" }, { term: "alias" }, { literal: "Persephone" }]]
  ],

  [
    "Literal object value: array of strings",
    _ => _.TheBeatles.are(["George", "Richard", "John", "Paul"]),
    [
      [
        { term: "TheBeatles" },
        { term: "are" },
        {
          literal: [
            { literal: "George" },
            { literal: "Richard" },
            { literal: "John" },
            { literal: "Paul" }
          ]
        }
      ]
    ]
  ],

  [
    "Literal object value: array of terms",
    _ => _.TheBeatles.are([_.George, _.Richard, _.John, _.Paul]),
    [
      [
        { term: "TheBeatles" },
        { term: "are" },
        {
          literal: [
            [{ term: "George" }],
            [{ term: "Richard" }],
            [{ term: "John" }],
            [{ term: "Paul" }]
          ]
        }
      ]
    ]
  ],

  [
    "Subject-predicate expands over multiple literals",
    _ => _.Alice.alias("Ali", "Alicia"),
    [
      [{ term: "Alice" }, { term: "alias" }, { literal: "Ali" }],
      [{ term: "Alice" }, { term: "alias" }, { literal: "Alicia" }]
    ]
  ],

  [
    "Subject + predicate expanded over multiple objects",
    _ => _.Alice(_.likes(_.Bob, _.Dave)),
    [
      [{ term: "Alice" }, { term: "likes" }, { term: "Bob" }],
      [{ term: "Alice" }, { term: "likes" }, { term: "Dave" }]
    ]
  ],

  [
    "Subject expands over plain and expanded predicate-objects",
    _ => _.Alice(_.likes(_.Bob, _.Dave), _.loves.Carol),
    [
      [{ term: "Alice" }, { term: "likes" }, { term: "Bob" }],
      [{ term: "Alice" }, { term: "likes" }, { term: "Dave" }],
      [{ term: "Alice" }, { term: "loves" }, { term: "Carol" }]
    ]
  ],

  [
    "Mixed standalone term and blank node in object position",
    _ => _.Alice(_.likes(_.Bob, _.a.Scientist), _.loves.Carol),
    [
      [{ term: "Alice" }, { term: "likes" }, { term: "Bob" }],
      [{ term: "Alice" }, { term: "likes" }, { term: { minted: 0 } }],
      [{ term: { minted: 0 } }, { term: "a" }, { term: "Scientist" }],
      [{ term: "Alice" }, { term: "loves" }, { term: "Carol" }]
    ]
  ],

  [
    "Predicate-object list as blank nodes in object position",
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
    "Predicate expands over object terms in predicate-object position.",
    _ => _.Alice(_.likes(_.a(_.Poet, _.Preacher)), _.loves.Carol),
    [
      [{ term: "Alice" }, { term: "likes" }, { term: { minted: 0 } }],
      [{ term: { minted: 0 } }, { term: "a" }, { term: "Poet" }],
      [{ term: { minted: 0 } }, { term: "a" }, { term: "Preacher" }],
      [{ term: "Alice" }, { term: "loves" }, { term: "Carol" }]
    ]
  ]
  /* No, we can't use this form for putting blank nodes in subject position
	 * because the p-o list can be interpreted in object position as a list of
	 * blank nodes.

  [
    "Blank node expands over predicate object list",
    _ => _.a.Poet(_.is.Creative, _.is.Broke),
    [
      [{ term: { minted: 0 } }, { term: "a" }, { term: "Poet" }],
      [{ term: { minted: 0 } }, { term: "is" }, { term: "Creative" }],
      [{ term: { minted: 0 } }, { term: "is" }, { term: "Broke" }]
    ]
  ],

  [
    "Blank node in subject and object positions",
    _ => _.a.Poet(_.knows(_.a.Poet)),
    [
      [{ term: { minted: 0 } }, { term: "a" }, { term: "Poet" }],
      [{ term: { minted: 0 } }, { term: "knows" }, { term: { minted: 0 } }],
      [{ term: { minted: 1 } }, { term: "a" }, { term: "Poet" }]
    ]
  ]
*/
];

function test() {
  for (const [name, fn, expect] of TEST_CASES) {
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

    console.log(`===`, name);
    console.log(`---`, expressions.join(", "));

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
