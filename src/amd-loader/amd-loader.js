const PUSHPOP = false;

// General-purpose async registry for coordinating requests with things.  Lets
// consumers await items until providers register them by name.
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
  const modules = make_registry();

  // These require methods should be enclosed

  const require_internal = url =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.async = true;
      script.src = url;

      const remove = () => script.parentNode.removeChild(script);

      script.onload = async () => {
        remove();
        // This pop is used to coordinate with script, where define should have
        // been the last thing executed.
        const { context, lambda } = stack.pop();
        const { needs, factory } = context;
        const result = lambda(require_internal);
        if (PUSHPOP) console.log(stack.length, url, `POPPED`, ...needs, result);

        resolve(result);
        const mod = await result;

        modules.register(url, mod);
        console.log(url, "depends on", needs, mod);

        if (PUSHPOP) console.log("RESOLVED POP", url, "TO", mod);
      };
      script.onerror = error => {
        remove();
        reject(error);
      };
      document.head.appendChild(script);
    });

  const meet = (needs, factory) =>
    Promise.all(needs.map(require_internal), imports => factory(...imports));

  // side-effects only
  const require = (a, b) => {
    // needs + factory
    if (Array.isArray(a) && typeof b === "function") meet(a, b);
    else if (typeof a === "function") a();
  };

  const define = (first, second, third) => {
    const [given_name, needs, factory] =
      typeof first === "string"
        ? [first, second, third]
        : [undefined, first, second];

    if (PUSHPOP) console.log(stack.length, `PUSH`, ...needs);
    stack.push({
      context: { given_name, needs, factory },
      lambda: require =>
        meet(needs, factory).then(imports => {
          if (PUSHPOP) console.log(`imports`, imports);
          return factory(...imports);
        }),
    });
  };

  return { require, define };
};

function main() {
  Object.assign(window, make_loader());
}

main();
