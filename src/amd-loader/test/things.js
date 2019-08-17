// amd loader with async maps
(function() {
  const with_async = (base = new Map(), pending = new Map()) =>
    Object.create(base, {
      // Without this, you get (in with_memo.get) "`has` called on incompatible
      // object", but shouldn't this delegate to base?  (the prototype)?
      has: {
        value(key) {
          return base.has(key);
        },
      },
      get: {
        async value(key) {
          if (base.has(key)) return base.get(key);
          if (pending.has(key)) return pending.get(key).promise;

          let resolve;
          const promise = new Promise(_resolve => {
            resolve = _resolve;
          }).finally(() => pending.delete(key));
          pending.set(key, { promise, resolve });

          return promise;
        },
      },
      set: {
        value(key, value) {
          if (pending.has(key)) pending.get(key).resolve(value);
          return base.set(key, value);
        },
      },
    });

  const definitions = with_async();

  const define = (id, dependencies, factory) => {
    if (!Array.isArray(dependencies)) return define(id, [], dependencies);
    definitions.set(id, { id, dependencies, factory });
  };

  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));

  define("C", ["A", "B"], (a, b) => `${a} and ${b}`);

  (async function() {
    await sleep(1000);
    console.log(`defining B`);
    let beta = 0;
    define("B", [], () => `beta ${++beta}`);

    await sleep(1000);
    console.log(`defining A`);
    define("A", "alpha");
  })();

  const with_memo = (base, transform) =>
    Object.create(base, {
      get: {
        value(key) {
          if (base.has(key)) return base.get(key);
          const value = transform(key);
          base.set(key, value);
          return value;
        },
      },
    });

  function amd_construct({ dependencies, factory }, context) {
    const exports = {};
    const module = { exports };
    const require = () => {}; // make_contextualized_require(context);
    const special = { module, exports, require };
    // const imports = dependencies.map(id => special[id] || context.imports[id]);
    const imports = dependencies.map(
      (id, i) => special[id] || context.imports[i]
    );
    const result =
      typeof factory === "function" ? factory(...imports) : factory;
    return dependencies.includes("exports") ? exports : result;
  }

  const modules = with_memo(with_async(), async id => {
    console.log(`modules: awaiting definitions of`, id);
    const definition = await definitions.get(id);
    console.log(`modules for ${id} got`, definition);
    const { dependencies } = definition;
    const imports = await Promise.all(dependencies.map(id => modules.get(id)));
    console.log(`modules for ${id} resolved to`, imports);
    const result = amd_construct(definition, { imports });
    console.log(`modules for ${id} constructed`, result);
    return result;
  });

  const require = (dependencies, factory) => {
    Promise.all(dependencies.map(id => modules.get(id))).then(async imports => {
      // not expecting a return value from require, so some of the special logic isn't needed?
      amd_construct({ dependencies, factory }, { imports });
    });
  };

  require(["C"], c => console.log(`I required c:`, { c }));
  require(["C", "B"], (c, b) => console.log(`I required c & b:`, { c, b }));
  require(["A", "B"], (a, b) => console.log(`I required a & b:`, { a, b }));
  require(["A"], a => console.log(`I required a:`, { a }));
  require(["B"], b => console.log(`I required b:`, { b }));
})();
