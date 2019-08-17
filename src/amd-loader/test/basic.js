// Plain JS implementation of *basic* AMD define/require (named modules only).

(function() {
  /** Reify Object's dictionary operations in a Map-like interface. */
  // You can't extend map instances without running into problems.
  // https://tc39.es/ecma262/#sec-map.prototype.has
  // https://stackoverflow.com/a/48738347
  const make_namespace = () => {
    const store = Object.create(null);
    return {
      has: key => key in store,
      get: key => store[key],
      set: (key, value) => (store[key] = value),
      delete: key => delete store[key],
    };
  };

  const with_async = (base = make_namespace(), pending = make_namespace()) =>
    Object.assign(Object.create(base), {
      async get(key) {
        if (base.has(key)) return base.get(key);
        if (pending.has(key)) return pending.get(key).promise;

        let resolve;
        const promise = new Promise(_resolve => {
          resolve = _resolve;
        }).finally(() => pending.delete(key));
        pending.set(key, { promise, resolve });

        return promise;
      },
      set(key, value) {
        if (pending.has(key)) pending.get(key).resolve(value);
        return base.set(key, value);
      },
    });

  const with_memo = (base, transform) =>
    Object.assign(Object.create(base), {
      get(key) {
        if (base.has(key)) return base.get(key);
        const value = transform(key);
        base.set(key, value);
        return value;
      },
    });

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
    const require = () => {}; // make_contextualized_require(context);
    const special = { module, exports, require };
    const imports = dependencies.map(id => special[id] || context.imports[id]);
    const result =
      typeof factory === "function" ? factory(...imports) : factory;
    return dependencies.includes("exports") ? exports : result;
  }

  // ==== instances
  const DEFAULT_IMPORTS = ["require", "exports", "module"];

  const make_define_require = () => {
    const definitions = with_async();

    const define = (...args) => {
      const [id, dependencies, factory] = args;
      // “The dependencies argument is optional. If omitted, it should default
      // to ["require", "exports", "module"]. ”
      if (args.length === 2) return define(id, DEFAULT_IMPORTS, dependencies);
      definitions.set(id, { id, dependencies, factory });
    };

    // “If the factory is a function it should only be executed once.” (re memo)
    const modules = with_memo(with_async(), async id => {
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

    return { define, require };
  };

  const { define } = Object.assign(window, make_define_require());

  define("@def.codes/amd-support", {
    make_namespace,
    with_async,
    with_memo,
  });
})();
