import { test_case } from "@def.codes/function-testing";

import { with_scanner } from "@def.codes/expression-reader";
import { expecting_statements } from "@def.codes/rdf-expressions";

const scan_statements = x => [...expecting_statements(with_scanner(x))];

export const TEST_CASES_2 = ([
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
  ],

  [
    "Example from a typical model.",
    _ => [
      _.Alice(_.hasInterval(150)),
      _.vv(_.viewOf.Alice, _.viewIn.more),
      _.Bob(
        _.listensTo.Alice,
        _.transformsWith(_.partitionsWith({ size: 5, step: 1 }))
      ),
      _.home.contains.BobHome,
      _.BobView(_.viewOf.Bob, _.viewIn.BobHome),
      _.Carol(
        _.listensTo.Alice,
        _.transformsWith(_.partitionsWith({ size: 9, step: 3 }))
      ),
      _.home.contains.CarolHome,
      _.CarolView(_.viewOf.Carol, _.viewIn.CarolHome)
    ],
    [
      [{ term: "Alice" }, { term: "hasInterval" }, { literal: 150 }],
      [{ term: "vv" }, { term: "viewOf" }, { term: "Alice" }],
      [{ term: "vv" }, { term: "viewIn" }, { term: "more" }],

      [{ term: "Bob" }, { term: "listensTo" }, { term: "Alice" }],
      [{ term: "Bob" }, { term: "transformsWith" }, { term: { minted: 0 } }],
      [
        { term: { minted: 0 } },
        { term: "partitionsWith" },
        { literal: { size: { literal: 5 }, step: { literal: 1 } } }
      ],
      [{ term: "home" }, { term: "contains" }, { term: "BobHome" }],
      [{ term: "BobView" }, { term: "viewOf" }, { term: "Bob" }],
      [{ term: "BobView" }, { term: "viewIn" }, { term: "BobHome" }],
      [{ term: "Carol" }, { term: "listensTo" }, { term: "Alice" }],
      [{ term: "Carol" }, { term: "transformsWith" }, { term: { minted: 1 } }],
      [
        { term: { minted: 1 } },
        { term: "partitionsWith" },
        { literal: { size: { literal: 9 }, step: { literal: 3 } } }
      ],
      // Sometimes this triple ends up at the end instead of here?
      // Anyway, the function should have set semantics, as the order does not matter.
      [{ term: "home" }, { term: "contains" }, { term: "CarolHome" }],
      [{ term: "CarolView" }, { term: "viewOf" }, { term: "Carol" }],
      [{ term: "CarolView" }, { term: "viewIn" }, { term: "CarolHome" }]
    ]
  ]
] as const).map(([name, args, output]) =>
  test_case(scan_statements, [args], output, name)
);
