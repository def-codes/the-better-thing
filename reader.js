// Reader for a subset of JS.  Returns AST's that can be used to support extreme
// late-binding and lazy-eval expressions.
//
// Invariant: proxies should never escape reader.
var userland_code_reader = (function() {
  const inspect = require && require("util").inspect;
  const CONTEXT = Symbol("context");
  const EXPR = Symbol("expr");

  // General walker for plain JS objects.
  function* walk(x, path = []) {
    if (Array.isArray(x))
      for (let i = 0; i < x.length; i++) yield* walk(x[i], [...path, i]);
    else if (x !== null && typeof x === "object") {
      for (const [k, v] of Object.entries(x)) yield* walk(v, [...path, k]);
      for (const s of Object.getOwnPropertySymbols(x))
        yield* walk(x[s], [...path, s]);
    } else yield [x, path];
  }

  const map_deep = (fn, x) =>
    Array.isArray(x)
      ? x.map(item => map_deep(fn, item))
      : x !== null && typeof x === "object"
      ? Object.entries(x).reduce(
          (acc, [k, v]) => Object.assign(acc, { [k]: map_deep(fn, v) }),
          {}
        )
      : fn(x);

  const serialize_literal = val =>
    Array.isArray(val)
      ? `[${val.map(serialize).join(", ")}]`
      : val !== null && typeof val === "object"
      ? `{${Object.entries(val)
          .map(([key, value]) => `${key}: ${serialize(value)}`)
          .join(", ")}}`
      : val.toString();

  const serialize = expr =>
    !Array.isArray(expr)
      ? `not an array: ${JSON.stringify(expr)}`
      : expr.reduce(
          (acc, val) =>
            val.set
              ? `${val.set.key} = ${serialize(val.set.value)}`
              : val.args
              ? acc + `(${val.args.map(serialize).join(", ")})`
              : val.key
              ? acc + (acc ? "." : "") + val.key
              : val.literal
              ? serialize_literal(val.literal)
              : "unk",
          ""
        );

  // Short-circuits for all crazy proxies.  Mostly to prevent inspection from
  // blowing up.
  const ALWAYS = {
    [Symbol.unscopables]: undefined, // checked when using `with` block
    [Symbol.iterator]: undefined,
    [Symbol.toPrimitive]: undefined,
    [Symbol.toStringTag]: undefined,
    [inspect && inspect.custom]: undefined,
    toJSON: () => `{"crazy":"proxy"}`,
    toString: () => `unsupported`,
    inspect: undefined // for node only
  };

  const make_crazy_proxy = collector => {
    let expr_id = 0;

    const make_proxy = (context = []) => {
      collector.push(context);

      // Use function as target so that result is always invokable.
      const target = () => {};
      const local = { [CONTEXT]: context };

      // Replace a proxy with plain objects.
      const sanitize_proxy = value => value[CONTEXT] || [{ literal: value }];

      // Recursively expunge proxies from constituent values.
      const sanitize = x => map_deep(sanitize_proxy, x);

      // Extend a proxy's context with a new expression segment.
      const recur_with = step =>
        make_proxy([
          ...context,
          Object.assign(step, {
            [EXPR]: expr_id++
          })
        ]);

      const scopes = [ALWAYS, local];
      return new Proxy(target, {
        has: (target, key) => true,

        apply: (_target, _this, args) => recur_with({ args: sanitize(args) }),

        set: (_target, key, value) => recur_with({ set: { key, value } }),

        get: (_target, key, _receiver) => {
          // Interesting, the runtime queries name on a function that's being
          // assigned to a variable.  I assume this is related to the automatic
          // assignment of var names to anonymous function expressions.  The
          // only way I can think of to get this out is to detect the
          //
          //     set = <expr>.name
          //
          // pattern after the fact.
          if (key === "name") console.log(`name?`, context);

          for (const scope of scopes) if (key in scope) return scope[key];
          return recur_with({ key });
        }
      });
    };

    return make_proxy();
  };

  const read = userland_code => {
    const collector = [];
    new Function(
      "world",
      `with (world) { 
${userland_code}
}`
    )(make_crazy_proxy(collector));
    return collector;
  };

  // ===== TEST
  const TEST_LINES = `OneTerm
TermWith(SomeArgument)
This.Isa.Triple
x.strength(10)
names(Alice, Bob, Carol)
names([george, paul, john])
Kilroy.was.here
a = plus(b, c)
you.and(what.$army)
one.for(the.money, two.for.the.show)(3)`;
  const lines = TEST_LINES.split("\n");
  const t = read(TEST_LINES);
  const idx = new Map();
  for (const expr of t)
    idx.set(
      expr,
      [...walk(expr)]
        .filter(([v, path]) => path[path.length - 1] === EXPR)
        .map(([v]) => v)
    );

  let i = 0;
  for (const expr of t) {
    const ids = idx.get(expr);
    const unique = ids.some(id => {
      for (const [key, value] of idx.entries())
        if (key !== expr) if (value.includes(id)) return false;
      return true;
    });
    if (unique) {
      const expected = lines[i++];
      const got = serialize(expr);
      if (got === expected) {
        // console.log(`PASS`, got);
      } else console.log("FAIL", { expected, got });
    }
  }

  return { read };
})();
