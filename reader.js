/*

Reader for a term-oriented subset of JS.  Returns quasi-AST's that can be used
to support extreme late-binding and lazy-eval expressions.  They are "quasi"
AST's because they are not exactly tree-structured as such.

Technically, this is a general-purpose tool (to the extent it has any purpose at
all), but it was motivated by the wish to bootstrap a userland programming
environment combining aspects of Turtle and Lisp.  The intention was never to
make a language that is interesting in its own right, but to leverage an
existing host in the service of a dynamic system that could in turn be used to
build more powerful interpreters.

This is a reader only and does not impute any semantics to the constructions it
collects.

Invariant: proxies should never escape reader.

## Concepts

The central thing you can use is the *Term*.  The reader will not recognize
anything that isn't rooted in a Term.

A Term can be chained to another Term using the dot operator.  This creates a
new thing that let's call a Chain.

You can use expressions consisting of *terms*, and *appllications*, and within
applications you can use any expression.


Documentation of capabilities and format.

(See the type definition)

The output structure includes two types of top-level statement: expressions, and
assignments.  An assignment associates an expression with a term.  An expression
is a nested list of elements.  There are three types of element: terms,
applications, and literals.  Literals comprise Arrays, Objects, Primitives, and
expressions.  Both array elements and object key values can be expressions.  For
these purposes, we count lambdas and regexp literals as primitives, since they
are opaque.

This reader is limited by the capabilities of the technique.

While the language is technically JS, the reader is only concerned with what can
be captured by proxies.  In particular, the following constructs are
undetectable:

- control flow (if, for, while, do, try, throw, return, with!)
- declaration (var, let, const, function)
- operators (+, -, *, in, instanceof, typeof, etc)

These constructs can be used inside of lambdas that are captured by the reader,
but they cannot be captured at the top level.  While the reader can't prevent
their use, the result of doing so is undefined.

We can only capture arbitrary terms when they are used against other proxy
expressions.  So, for example,

A.B

is okay, but NOT

{}.foo
[].foo
"".foo
(3).foo

As those terms will attempt to resolve against the respective prototypes of the
literal expressions.  The same is true for parenthesized expressions that
resolve to those types.

Note that a similar approach could be taken in Node by using a VM with a Proxy
as the context.  The VM could thus be used in place of the `with` block.

*/
var userland_code_reader = (function() {
  const globalThis = this;
  const inspect = globalThis.require && globalThis.require("util").inspect;
  const CONTEXT = Symbol("context");
  const EXPR = Symbol("expr");

  // General walker for plain JS objects.  Uses reverse path.
  function* walk(x, path = []) {
    if (Array.isArray(x))
      for (let i = 0; i < x.length; i++) yield* walk(x[i], [i, ...path]);
    else if (x !== null && typeof x === "object") {
      for (const [k, v] of Object.entries(x)) yield* walk(v, [k, ...path]);
      for (const s of Object.getOwnPropertySymbols(x))
        yield* walk(x[s], [s, ...path]);
    } else yield [x, path];
  }

  // General mapper over plain JS objects
  const map = (fn, x) =>
    Array.isArray(x)
      ? x.map(fn)
      : x !== null && typeof x === "object"
      ? Object.entries(x).reduce(
          (acc, [k, v]) => Object.assign(acc, { [k]: fn(v) }),
          {}
        )
      : fn(x);

  // Mostly short circuits to prevent proxies from blowing up inspection.
  const ALWAYS = {
    [Symbol.unscopables]: undefined, // checked when using `with` block
    [Symbol.iterator]: undefined,
    [Symbol.toPrimitive]: undefined,
    [Symbol.toStringTag]: undefined,
    [inspect && inspect.custom]: undefined,
    toJSON: () => `{"crazy":"proxy"}`, // mostly to smoke out who's asking
    toString: () => `unsupported`,
    inspect: undefined // for node only
  };

  // Replace a proxy with plain objects.
  const sanitize_proxy = value => value[CONTEXT] || [{ literal: value }];

  // Recursively expunge proxies from constituent values.
  const sanitize = x =>
    map(v => {
      const context = v[CONTEXT];
      if (!context)
        return {
          literal: Array.isArray(v)
            ? v.map(sanitize)
            : v !== null && typeof v === "object"
            ? Object.entries(v).reduce(
                (acc, [k, v]) => Object.assign(acc, { [k]: sanitize(v) }),
                {}
              )
            : v
        };

      const { args, assign } = context;
      return args
        ? { args: args.map(sanitize) }
        : assign
        ? { assign: { ...assign, value: sanitize(assign.value) } }
        : context;
    }, x);

  // Use the same target for every proxy.  We don't do anything with the actual
  // object, so there's no need to instantiate a new target each time.
  //
  // Use function as target so that result is always invokable.
  const target = () => {};

  const make_scanner = collector => {
    let expr_id = 0;

    const make_proxy = (context = []) => {
      collector.push(context);

      // Extend a proxy's context with a new expression segment.
      const recur_with = step =>
        make_proxy([...context, Object.assign(step, { [EXPR]: expr_id++ })]);

      const scopes = [ALWAYS, { [CONTEXT]: context }];
      return new Proxy(target, {
        has: (_target, _key) => true,

        apply: (_target, _this, args) => recur_with({ args: sanitize(args) }),

        set: (_target, key, value) =>
          recur_with({ assign: { term: key, value: sanitize(value) } }),

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
          return recur_with({ term: key });
        }
      });
    };

    return make_proxy();
  };

  /*
    The trick to collecting statements is that we can't tell in the proxy where
    we are relative to any other expression.  To solve this, we keep a unique ID
    on every expression and dump the accumulated context every time it changes.
    Basically a “statement” is an expression that isn't part of another
    expression.  So we return only the contexts containing at least one element
    not used in any other context.
   */

  // The serialization is really just for tests

  const serialize_literal = val =>
    Array.isArray(val)
      ? `[${val.map(serialize).join(", ")}]`
      : val !== null && typeof val === "object"
      ? `{${Object.entries(val)
          .map(([key, value]) => `${key}: ${serialize(value)}`)
          .join(", ")}}`
      : typeof val === "string"
      ? JSON.stringify(val)
      : val.toString();

  const serialize = expr =>
    Array.isArray(expr)
      ? expr.reduce(
          (acc, val) =>
            val.assign
              ? `${val.assign.term} = ${serialize(val.assign.value)}`
              : val.args
              ? acc + `(${val.args.map(serialize).join(", ")})`
              : val.term
              ? acc + (acc ? "." : "") + val.term
              : "unk",
          ""
        )
      : expr.literal
      ? serialize_literal(expr.literal)
      : "unk";

  const scan = code => {
    const contexts = [];
    new Function("world", `with (world) { ${code} }`)(make_scanner(contexts));
    return contexts;
  };

  const read = (userland_code, TEST_MODE) => {
    const collected = scan(userland_code);

    // Get all of the expression id's referenced for each context.
    const idx = new Map();
    for (const expr of collected)
      idx.set(
        expr,
        [...walk(expr)].filter(([v, [key]]) => key === EXPR).map(([v]) => v)
      );

    // For tests only
    const lines = userland_code.split("\n");
    let i = 0;

    const statements = [];
    for (const expr of collected) {
      const unique = idx.get(expr).some(id => {
        for (const [key, value] of idx.entries())
          if (key !== expr && value.includes(id)) return false;
        return true;
      });
      if (unique) {
        statements.push(expr);

        if (TEST_MODE) {
          const expected = lines[i++];
          const got = serialize(expr);
          if (got === expected) {
            // console.log(`PASS`, got);
          } else console.log("FAIL", { expected, got }, expr);
        }
      }
    }

    return statements;
  };

  ///////////// TEST
  if (false) {
    const result = read(
      `OneTerm
a = b
f.y(n => n.weight)
TermWith(SomeArgument)
This.Isa.Triple
x.strength(10)
stream.hasSource(sub => { sub.next("hello"); sub.next("world"); })
who.calls(() => { throw "me"; })
You(get.a.car).You(get.a.car).everybody(gets.a.car)
dict({roses: "red", violets: blue, sugar: true})
names(Alice, Bob, Carol)
names([george, paul, john])
Kilroy.was.here
a = plus(b, c)
you.and(what.$army)
one.for(the.money, two.for.the.show)(3)`,
      true
    );
    //////////////////////// TEST
  }

  return { read };
})();
