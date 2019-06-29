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

// How to make this work in Node with ES modules?
//const globalThis = this;
//const inspect = globalThis.require && globalThis.require("util").inspect;
const CONTEXT = Symbol("context");
const EXPR = Symbol("expr");

// Mostly short circuits to prevent proxies from blowing up inspection.
const ALWAYS = {
  [Symbol.unscopables]: undefined, // checked when using `with` block
  [Symbol.iterator]: undefined,
  [Symbol.toPrimitive]: undefined,
  [Symbol.toStringTag]: undefined,
  //[inspect && inspect.custom]: undefined,
  toJSON: () => `{"crazy":"proxy"}`, // mostly to smoke out who's asking
  toString: () => `unsupported`,
  inspect: undefined // for node only
};

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
  The trick to collecting statements is that we can't tell in the proxy where we
  are relative to any other expression.  To solve this, we keep a unique ID on
  every expression and dump the accumulated context every time it changes.
  Basically a “statement” is an expression that isn't part of another
  expression.  So we return only the contexts containing at least one element
  not used in any other context.
*/
// Normalize scan results.
const normalize = collected => {
  // Get all of the expression id's referenced for each context.
  const idx = new Map();
  for (const expr of collected)
    idx.set(
      expr,
      [...walk(expr)].filter(([v, [key]]) => key === EXPR).map(([v]) => v)
    );

  const statements = [];
  for (const expr of collected) {
    const unique = idx.get(expr).some(id => {
      for (const [key, value] of idx.entries())
        if (key !== expr && value.includes(id)) return false;
      return true;
    });

    if (unique) statements.push(expr);
  }
  return statements;
};

/** Run the given function with an expression scanner as its argument and return
 * the collected statements.. */
export const with_scanner = fn => {
  const contexts = [];
  fn(make_scanner(contexts));
  return normalize(contexts);
};
