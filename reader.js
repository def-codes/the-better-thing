/*

Reader for a term-oriented subset of JS.  Returns quasi-AST's that can be used
to support extreme late-binding and lazy-eval expressions.  They are "quasi"
AST's because they are not exactly tree-structured as such.

Technically, this is a general-purpose tool (to the extent it has any purpose at
all), but it was motivated by the wish to combine aspects of Turtle and Lisp
into a hosted environment where JavaScript evaluation is available.

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

The output structure includes two types of top-level statement: expressions, and
assignments.  An assignment associates an expression with a term.  An expression
is a nested list of elements.  There are three types of element: terms,
applications, and literals.  Literals comprise Arrays, Objects, Primitives, and
expressions.  Both array elements and object key values can be expressions.  For
these purposes, we count lambdas and regexp literals as primitives, since they
are opaque.

Here it is:

Assignment = { assign: { term: string, value: AnyExpression } }
TopExpression = [Term, (Term | Call)*]
Term = { term: string }
Call = { args: AnyExpression[] }
// nope. still wrong.  expression is wrapped in an array
AnyExpression = Expression | Literal
Literal = Term | Array | Object | Primitive
Primitive = string | number | boolean | symbol | bigint | RegExp (except don't use symbol)
Array = 

With this, it's possible to 

Examples
term
chain.of.terms
term(...ArgList)
chain.of.terms(...ArgList)
you.are(3).and.I.am(five)

This reader is limited by the capabilities of the technique.

Following is an initial attempt at defining the recognized grammar.

While the language is technically JS, the reader is only concerned with what can
be captured by proxies.  In particular, the following constructs are
undetectable:

- control flow (if, for, while, do, try, throw, return, with!)
- declaration (var, let, const, function)
- operators (+, -, *, in, instanceof, typeof, etc)

These constructs can be used inside of lambdas that are captured by the reader,
but they cannot be captured at the top level.  While the reader can't prevent
their use, the result of doing so is undefined.

Statement -> Expression | Assignment
Assignment -> Term = Expression
Expression -> Term | KeyAccess 
Term -> bottom?
Literal -> ObjectLiteral | ArrayLiteral | JSFunctionLiteral | JSPrimitiveLiteral | JSRegExpLiteral
ObjectLiteral -> basically an object literal where values are Expr
KeyAccess -> Expression.Term
ArrayLiteral -> [List]
Application -> Expression(List)
List -> ∅
List -> Expression, List

We can only capture arbitrary terms when they are used against other proxy
expressions.  So, for example,

A.B

is okay, as well as

A.B.C

and (technically)

(A.B).C

although it's not clear what the latter would mean, and I'm not sure I could (or
should) distinguish it from the former.

But it's NOT meaningful to say

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

  // This is no good, either, because it doesn't know that args arrays shouldn't
  // be treated as literals.
  const map_deep_no = (fn, x) =>
    Array.isArray(x)
      ? fn(x.map(item => map_deep(fn, item)))
      : x !== null && typeof x === "object"
      ? fn(
          Object.entries(x).reduce(
            (acc, [k, v]) => Object.assign(acc, { [k]: map_deep(fn, v) }),
            {}
          )
        )
      : fn(x);

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
        make_proxy([...context, Object.assign(step, { [EXPR]: expr_id++ })]);

      const scopes = [ALWAYS, local];
      return new Proxy(target, {
        has: (target, key) => true,

        apply: (_target, _this, args) => recur_with({ args: sanitize(args) }),

        set: (_target, key, value) =>
          recur_with({ set: { key, value: sanitize(value) } }),

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
      } else
        console.log("FAIL", { expected, got }, inspect(expr, { depth: 10 }));
    }
  }

  return { read };
})();
