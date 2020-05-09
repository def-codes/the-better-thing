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
            ["h2", "Alice"],
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
            ["h2", "Alice"],
            ["p", `I'm dynamic. That may not be relevant for this test.`],
            ["p", `Accomplishments: `, ["b", n]],
          ])
        ),
    }),
  };
});
