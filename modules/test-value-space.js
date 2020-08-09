define(["./value-space.js"], vs => {
  const { make_value_space } = vs;

  const space = make_value_space();
  const $ = space.constructors;

  const matchers = [
    {
      comment: "match any",
      when: $,
      then(sorry_no_bindings_yet) {
        console.log("I matched any!");
      },
    },
    { when: {}, then() {} },
  ];

  const messages = [
    3,
    null,
    "baraccuda",
    ["terminal", /asdf/],
    { $and: ["foo", "bar"] },
  ];

  for (const matcher of matchers) space.register(matcher);
  for (const message of messages) space.sink(message);
});
