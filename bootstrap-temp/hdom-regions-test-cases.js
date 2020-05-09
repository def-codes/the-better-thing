define(["@thi.ng/rstream", "@thi.ng/transducers"], (rs, tx) => {
  // const P = Object.getPrototypeOf;
  // const is_plain_object = x => x && P(P(x)) === null;
  // const is_element = x => x.element && x.attributes && x.children;
  // const h = (e, second, ...rest) =>
  //       is_plain_object(second) && !is_element(second)
  //     ? { element: e, attributes: second || {}, children: rest }
  //     : {
  //         element: e,
  //         attributes: {},
  //         children: second === undefined ? [] : [second, ...rest],
  //       };

  return {
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
      root: rs.fromIterable([""]).transform(
        tx.map(n => [
          "section",
          ["h1", "Example 1"],
          ["p", "This is Alice.  Alice will be defined."],
          ["placeholder", { id: "Alice" }],
          [
            "p",
            `Following would be Bob.  But Bob will never be defined.  So 
               that's the end of this example.`,
          ],
          ["placeholder", { id: "Bob" }],
        ])
      ),
      Alice: rs.fromIterable([""]).transform(
        tx.map(n => [
          "section",
          ["h2", "Alice"],
          [
            "p",
            `Hi, I'm Alice.  I should be mounted in the root template because 
               it asks for me by name.`,
          ],
        ])
      ),
    }),
    nested: () => ({
      root: rs.fromIterable([""]).transform(
        tx.map(n => [
          "section",
          ["h1", "Example 1"],
          ["p", "This is Alice.  Alice will be defined."],
          ["placeholder", { id: "Alice" }],
          [
            "p",
            `Following would be Bob.  But Bob will never be defined.  So that's 
             the end of this example.`,
          ],
          ["placeholder", { id: "Bob" }],
        ])
      ),
      Alice: rs
        .fromIterable([""])
        .transform(
          tx.map(n => [
            "section",
            ["h2", "Alice"],
            [
              "p",
              "Hi, I'm Alice.  These are my hobbies.  They will be defined.",
            ],
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
      root: rs.fromIterable([""]).transform(
        tx.map(n => [
          "section",
          ["h1", "Moving example"],
          [
            "p",
            `These are the winners.  Alice is a winner.  She will move up in 
             the ranks.`,
          ],
          ["placeholder", { id: "winners" }],
        ])
      ),
      winners: rs.fromInterval(2000).transform(
        tx.map(n => {
          const names = "Bob Carol Don Edgar Fran Gerald Hal Ivan Joel Kim Lawrence Marvin".split(
            " "
          );
          names.splice(-n, 0, "Alice");
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
            ["h2", "Alice"],
            [
              "p",
              `Hi, I'm Alice. I'm dynamic. I'm also moving up in the ranks.`,
            ],
            ["p", `Accomplishments: `, ["b", n]],
          ])
        ),
    }),
  };
});
