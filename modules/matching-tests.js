define(["./matching.js"], matching => {
  const { compile_matcher } = matching;

  const examples = [
    $ => null,
    $ => undefined,
    $ => true, // boolean literal
    $ => 44, // number literal
    $ => "mosquito", // string literal
    $ => $, // anything
    $ => $.symbol,
    $ => $.boolean,
    $ => $.number,
    $ => $.string,
    $ => $.bigint,
    $ => $.function,
    $ => [], // empty array
    $ => [$], // any one-tuple
    $ => [$, $], // any two-tuple
    $ => [$, $.x], // any two-tuple, second element bound to x
    $ => {}, // empty object? or any object
    $ => [undefined], // one-tuple containing `undefined`
    $ => ["Ave Maria"], // one-tuple containing "Ave Maria"
    $ => ["Ave Maria", $], // one-tuple containing "Ave Maria" followed by anything else
    $ => ({ foo: $ }),
    $ => ({ foo: "bar" }),
    $ => ({ name: /jo/i }),
    $ => ({ a: "dom:MouseEvent" }), //
    $ => ({ a: dom.MouseEvent }), //
  ];
});
