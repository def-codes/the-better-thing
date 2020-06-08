define(["@thi.ng/rstream", "@thi.ng/transducers"], (rs, tx) => {
  return {
    repro_OKAY_no_duplicate_because_not_empty: {
      label: "Just Alice",
      fn: () => ({
        root: rs.fromIterable([
          ["div", "clear"],
          ["div", ["placeholder", { id: "Alice" }]],
        ]),
        Alice: rs.fromIterable([["div", { resource: "Alice" }]]),
      }),
    },
    repro_duplicates_following_attributes: {
      label: "Just Alice",
      fn: () => ({
        root: rs.fromIterable([
          ["div", { id: "something" }],
          ["div", ["placeholder", { id: "Alice" }]],
        ]),
        Alice: rs.fromIterable([["div", { resource: "Alice" }]]),
      }),
    },
    repro_duplicates_Alice_minimal: {
      label: "Just Alice",
      fn: () => ({
        root: rs.fromIterable([
          ["div"],
          ["div", ["placeholder", { id: "Alice" }]],
        ]),
        Alice: rs.fromIterable([["div", { resource: "Alice" }]]),
      }),
    },
    repro_OKAY_clear: {
      label: "Empty",
      fn: () => ({
        root: rs.fromIterable([
          ["div", ["placeholder", { id: "Alice" }]],
          ["div"],
        ]),
        Alice: rs.fromIterable([["div", { resource: "Alice" }]]),
      }),
    },
    repro_duplicates_Alice_after_clear: {
      label: "Just Alice",
      fn: () => ({
        root: rs.fromIterable([
          ["div", ["placeholder", { id: "Alice" }]],
          ["div"],
          ["div", ["placeholder", { id: "Alice" }]],
        ]),
        Alice: rs.fromIterable([["div", { resource: "Alice" }]]),
      }),
    },
    repro_duplicates_separator: {
      comment: `Is this the only wrong case that doesn't involve an empty div followed by something else?`,
      label: "Alice / holy spirit / Bob",
      fn: () => ({
        root: rs.fromIterable([
          [
            "div",
            ["placeholder", { id: "Alice" }],
            ["placeholder", { id: "Bob" }],
          ],
          [
            "div",
            ["placeholder", { id: "Alice" }],
            ["b", "holy spirit"],
            ["placeholder", { id: "Bob" }],
          ],
        ]),
        Alice: rs.fromIterable([["div", { resource: "Alice" }]]),
        Bob: rs.fromIterable([["div", { resource: "Bob" }, "boy"]]),
      }),
    },
    repro_kills_Bob: {
      label: "Alice & Bob",
      fn: () => ({
        root: rs.fromIterable([
          [
            "div",
            ["placeholder", { id: "Alice" }],
            ["b", "holy spirit"],
            ["placeholder", { id: "Bob" }],
          ],
          [
            "div",
            ["placeholder", { id: "Alice" }],
            ["placeholder", { id: "Bob" }],
          ],
        ]),
        Alice: rs.fromIterable([["div", { resource: "Alice" }]]),
        Bob: rs.fromIterable([["div", { resource: "Bob" }, "boy"]]),
      }),
    },
    repro_duplicates_Alice: {
      label: "Alice & Bob",
      fn: () => ({
        root: rs.fromIterable([
          ["div", ["placeholder", { id: "Bob" }]],
          [
            "div",
            ["placeholder", { id: "Alice" }],
            ["placeholder", { id: "Bob" }],
          ],
        ]),
        Alice: rs.fromIterable([["div", { resource: "Alice" }]]),
        Bob: rs.fromIterable([["div", { resource: "Bob" }, "boy"]]),
      }),
    },
    repro_duplicates_Bob: {
      label: "Alice & Bob",
      fn: () => ({
        root: rs.fromIterable([
          ["div", ["placeholder", { id: "Alice" }]],
          [
            "div",
            ["placeholder", { id: "Alice" }],
            ["placeholder", { id: "Bob" }],
          ],
        ]),
        Alice: rs.fromIterable([["div", { resource: "Alice" }]]),
        Bob: rs.fromIterable([["div", { resource: "Bob" }, "boy"]]),
      }),
    },
    repro_duplicates_both_alternating: {
      label: "Alice & Bob",
      fn: () => ({
        root: rs.fromIterable([
          ["div"],
          [
            "div",
            ["placeholder", { id: "Alice" }],
            ["placeholder", { id: "Bob" }],
          ],
        ]),
        Alice: rs.fromIterable([["div", { resource: "Alice" }]]),
        Bob: rs.fromIterable([["div", { resource: "Bob" }, "boy"]]),
      }),
    },
    repro_duplicates_both: {
      comment: "same result as previous",
      label: "Alice & Bob",
      fn: () => ({
        root: rs.fromIterable([
          ["div"],
          [
            "div",
            ["placeholder", { id: "Alice" }],
            ["placeholder", { id: "Bob" }],
          ],
        ]),
        Alice: rs.fromIterable([
          ["div", { resource: "Alice" }],
          ["div", { resource: "Alice" }, "woman"],
        ]),
        Bob: rs.fromIterable([["div", { resource: "Bob" }, "boy"]]),
      }),
    },
    simplest: () => ({
      root: rs.fromIterable([""]).transform(
        tx.map(n => [
          "section",
          ["h1", "Example 1"],
          [
            "p",
            `This is the root.  There's nothing else in this example, but if you can see
             this, that means the root mounted.`,
          ],
          ["p", "See you in the next example!"],
        ])
      ),
    }),
    mount: () => ({
      root: rs
        .fromIterable([""])
        .transform(
          tx.map(n => [
            "section",
            ["h1", "Example 1"],
            ["p", "This is Alice.  Alice will be defined."],
            ["placeholder", { id: "Alice" }],
            ["p", `Following would be Bob, if he were defined.`],
            ["placeholder", { id: "Bob" }],
          ])
        ),
      Alice: rs
        .fromIterable([""])
        .transform(
          tx.map(n => [
            "article",
            ["h2", "Alice"],
            ["p", `I've been called by name, so you should see me.`],
          ])
        ),
    }),
    nested: () => ({
      root: rs
        .fromIterable([""])
        .transform(
          tx.map(n => [
            "section",
            ["h1", "Example 1"],
            ["p", "This is Alice.  Alice will be defined."],
            ["placeholder", { id: "Alice" }],
            ["p", `Following would be Bob, if he were defined.`],
            ["placeholder", { id: "Bob" }],
          ])
        ),
      Alice: rs
        .fromIterable([""])
        .transform(
          tx.map(n => [
            "section",
            ["p", "Hi, I'm Alice.  I have a growing list of hobbies."],
            ["placeholder", { id: "AliceHobbies" }],
          ])
        ),
      AliceHobbies: rs.fromInterval(3000).transform(
        tx.map(n => [
          "ul",
          {},
          // Generator expressions are not supported, must unroll
          ...tx.map(
            x => ["li", x],
            "running jumping flying shaking quaking crowing blasting wresting"
              .split(" ")
              .slice(0, n)
          ),
        ])
      ),
    }),
    moving: () => ({
      root: rs
        .fromIterable([""])
        .transform(
          tx.map(n => [
            "section",
            ["h1", "Moving example"],
            ["p", `These are the rankings.  Alice moves up in the ranks.`],
            ["placeholder", { id: "winners" }],
            ["p", "Well, here's Alice anyway"],
            ["placeholder", { id: "Alice" }],
          ])
        ),
      winners: rs.fromInterval(2000).transform(
        tx.map(n => {
          const names = "Bob Carol Don Edgar Fran Gerald Hal Ivan Joel Kim Lawrence Marvin".split(
            " "
          );
          names.splice(-(n + 1), 0, "Alice");
          return [
            "ol",
            ...tx.map(
              id => ["li", id === "Alice" ? ["placeholder", { id }] : id],
              names
            ),
          ];
        })
      ),
      Alice: rs
        .fromInterval(1000)
        .transform(
          tx.map(n => [
            "section",
            ["p", `I'm Alice. I'm dynamic. I'm also moving up in the ranks.`],
            ["p", `Accomplishments: `, ["b", n]],
          ])
        ),
    }),
    removing: () => ({
      root: rs
        .fromInterval(1000)
        .transform(
          tx.map(n => [
            "section",
            ["h1", "Removing example"],
            ["p", `Alice will be here only when this number is even: ${n}`],
            n % 2 ? ["i", "not Alice"] : ["placeholder", { id: "Alice" }],
          ])
        ),
      Alice: rs
        .fromInterval(1000)
        .transform(
          tx.map(n => [
            "section",
            [
              "p",
              `I'm Alice.  I'm dynamic. That may not be relevant for this test.`,
            ],
            ["p", `Accomplishments: `, ["b", n]],
          ])
        ),
    }),
  };
});
