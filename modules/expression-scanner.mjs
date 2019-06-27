// How to make this work in Node with ES modules?

//const globalThis = this;
//const inspect = globalThis.require && globalThis.require("util").inspect;
const CONTEXT = Symbol("context");
export const EXPR = Symbol("expr");

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

export const make_scanner = collector => {
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
