// Plain JS implementation of *basic* AMD define/require (named defines only).
// Basic support has no notion of name resolution (all id's are interpreted as
// given), nor any notion of remote scripts (all modules are taken as given).

(function() {
  /** Reify Object's dictionary operations in a Map-like interface. */
  // You can't extend map instances without running into problems.
  // https://tc39.es/ecma262/#sec-map.prototype.has
  // https://stackoverflow.com/a/48738347
  const namespace = (store = Object.create(null)) => ({
    store, // DEBUG
    entries: () => Object.entries(store),
    keys: () => Object.keys(store),
    has: key => key in store,
    get: key => store[key],
    set(key, value) {
      store[key] = value;
      return this;
    },
    delete: key => delete store[key],
  });

  /** Return a new `Promise` along with its extracted resolve/reject methods. */
  const trigger = () => {
    let resolve, reject;
    const promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    return [promise, resolve, reject];
  };

  /** General-purpose async registry for coordinating requests with things.
   *  Extends a given namespace (or a default one) so that requests for
   *  undefined things return promises, which resolve as things are defined.
   *  Lets consumers await items until providers register them by name.  Note
   *  that once a value is set, there are not notifications of later updates. */
  const async_namespace = (base = namespace(), pending = namespace()) =>
    Object.assign(Object.create(base), {
      async get(key) {
        if (base.has(key)) return base.get(key);
        if (pending.has(key)) return pending.get(key).promise;

        const [promise, resolve] = trigger();
        pending.set(key, { promise, resolve });

        return promise.finally(() => pending.delete(key));
      },
      set(key, value) {
        if (pending.has(key)) pending.get(key).resolve(value);
        return base.set(key, value);
      },
    });

  const memoized_namespace = (base, transform) =>
    Object.assign(Object.create(base), {
      get(key) {
        if (base.has(key)) return base.get(key);
        const value = transform(key);
        base.set(key, value);
        return value;
      },
    });

  // AMD-specific stuff

  const resolve_all = (dependencies, modules) =>
    Promise.all(dependencies.map(id => modules.get(id))).then(resolved =>
      resolved.reduce(
        (map, mod, index) => Object.assign(map, { [dependencies[index]]: mod }),
        {}
      )
    );

  function amd_construct({ dependencies, factory }, context) {
    const exports = {};
    const module = { exports };
    //const require = () => {}; // make_contextualized_require(context);
    const special = { module, exports };
    const imports = dependencies.map(id => special[id] || context.imports[id]);
    const result =
      typeof factory === "function" ? factory(...imports) : factory;
    return dependencies.includes("exports") ? exports : result;
  }

  // The spec says that “If omitted, [the dependencies argument] should default
  // to ["require", "exports", "module"].”  However, the constructor uses the
  // presence of an `exports` dependency to determine how to obtain the module
  // from the factory.  This breaks nullary factories, and testing factory arity
  // (as also noted in the spec) has not proven reliable.  Anyway, I've never
  // seen those defaults used in the wild.
  const DEFAULT_IMPORTS = [];

  const make_basic_amd = () => {
    const definitions = async_namespace();

    const define = (...args) => {
      // Basic AMD assumes the first argument is always id.
      const [id, dependencies, factory] = args;
      // “The dependencies argument is optional.” (but see above).
      if (args.length === 2) return define(id, DEFAULT_IMPORTS, dependencies);
      definitions.set(id, { id, dependencies, factory });
    };

    // “If the factory is a function it should only be executed once.” (re memo)
    const modules = memoized_namespace(async_namespace(), async id => {
      const definition = await definitions.get(id);
      // Self-reference here
      const imports = await resolve_all(definition.dependencies, modules);
      // “If the factory function returns a value (an object, function, or any
      // value that coerces to true), then that value should be assigned as the
      // exported value for the module.”
      // Note the factory result here will be assigned regardless of truthiness.
      return amd_construct(definition, { imports });
    });

    const require = (dependencies, factory) => {
      resolve_all(dependencies, modules).then(imports => {
        // not expecting a return value from require, so some of the special logic isn't needed?
        amd_construct({ dependencies, factory }, { imports });
      });
    };

    // Include `definitions` and `modules` for visibility.
    return { define, require, definitions, modules };
  };

  // Don't assign this to global `define`/`require` because it's not yet a
  // complete AMD implementation.
  Object.assign(window, { "@def.codes/amd-basic": make_basic_amd() });

  window["@def.codes/amd-basic"].define("@def.codes/amd-basic-support", {
    namespace,
    async_namespace,
    memoized_namespace,
  });
})();
