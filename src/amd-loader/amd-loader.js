/** General-purpose async registry for coordinating requests with things.  Lets
 *  consumers await items until providers register them by name. */
const make_registry = () => {
  const things = Object.create(null);
  const pending = Object.create(null);

  const promise_for = name => {
    if (name in pending) return pending[name].promise;
    pending[name] = {};
    return (pending[name].promise = new Promise(resolve => {
      pending[name].resolve = resolve;
    }).then(thing => {
      delete pending[name];
      return thing;
    }));
  };

  return {
    has: name => name in things,
    request: name => (name in things ? things[name] : promise_for(name)),
    register: (name, thing) => {
      things[name] = thing;
      if (name in pending) pending[name].resolve(thing);
    },
  };
};

const make_loader = () => {
  const stack = [];

  // resolver is provisional; currently unused
  function require_from(resolver) {
    const modules = make_registry();

    const require_internal = url => {
      if (modules.has(url)) {
        console.log(`HAS`, url);
        return modules.request(url);
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = url;

      const remove = () => script.parentNode.removeChild(script);

      return new Promise((resolve, reject) => {
        script.onload = async () => {
          remove();
          // This `pop` is used to coordinate with script.  The flow from a
          // script's execution context to its `onload` handler is synchronous,
          // so this script's `define` should have been the last one executed.
          const { context, promise } = stack.pop();
          const result = promise(require);

          resolve(result);
          const module = await result;
          // 3rd arg is ignored.  map is better but current call site doesn't expect
          // because it's not parallel with other case (where module is taken synchronously.)
          modules.register(url, module, { ...context, module });
        };
        script.onerror = error => {
          remove();
          reject(error);
        };
        document.head.appendChild(script);
      });
    };

    const meet = (needs, factory) =>
      Promise.all(needs.map(require_internal)).then(imports =>
        factory(...imports)
      );

    // side-effects only.  needs + factory or standalone factory
    return Object.assign(
      function require(a, b) {
        if (Array.isArray(a) && typeof b === "function") meet(a, b);
        else if (typeof a === "function") a();
      },
      { internal: require_internal }
    );
  }

  const require = require_from();

  const define = (a, b, c) => {
    const [given_name, needs, factory] =
      typeof a === "string" ? [a, b, c] : [undefined, a, b];

    stack.push({
      context: { given_name, needs, factory },
      promise: require =>
        Promise.all(needs.map(require.internal)).then(imports =>
          factory(...imports)
        ),
    });
  };

  return { require, define };
};

function main() {
  Object.assign(window, make_loader());
}

main();
