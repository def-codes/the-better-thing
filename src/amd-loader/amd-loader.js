// eff it I'm writing my own require

/** Load the script at the given URL in the given document (by default, the
 *  current one).  Resolves (to `undefined`) when the load is complete, or
 *  rejects with any error.  Temporarily incudes the script element in the
 *  document's `head`. */
const load_script = (url, doc = document) =>
  new Promise((resolve, reject) => {
    const script = doc.createElement("script");
    script.src = url;
    script.async = true;

    const remove = () => script.parentNode.removeChild(script);

    script.onload = () => (remove(), resolve());
    script.onerror = error => (remove(), reject(error));

    // Triggers load
    doc.head.appendChild(script);
  });

// General-purpose async registry.  Lets consumers await items until providers
// register them by name.
const make_registry = () => {
  // A dictionary of the registered items
  const things = Object.create(null);
  // A dictionary for coordinating requests and things.
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

// this is a spec-defined concept... doesn't vary by configuration
// not using ATM anyway
// const REL = /^[./]/;
// const is_relative = name => REL.test(name);

const make_loader = () => {
  const modules = make_registry();

  const resolve = id => {
    if (!modules.has(id)) load_script(id);
    return modules.request(id);
  };

  const normalize_name = name => name;

  const require = (dependencies, factory) => {
    console.log(`REQUIRE dependencies, factory`, dependencies, factory);
    return Promise.all(dependencies.map(normalize_name).map(resolve)).then(
      imports => factory(...imports)
    );
  };

  const define = Object.assign(
    (first, second, third) => {
      // challenge: associate whatever we got with the module name from context

      const [given_name, dependencies, factory] = Array.isArray(first)
        ? [, first, second]
        : [first, second, third];
      console.log(
        `given_name, dependencies, factory`,
        given_name,
        dependencies,
        factory
      );

      if (given_name) {
        console.log(`well I mean you were given the name`, given_name);
      } else {
        console.log(
          `now this fella doesn't have a name`,
          dependencies,
          factory
        );
      }

      require(dependencies, factory).then(mod => {
        // hmmm. cache should only be set in one place?
        if (given_name) modules.register(given_name, mod);
        return mod;
      });
    },
    { amd: {} }
  );

  return { require, define };
};

function main() {
  Object.assign(window, make_loader());
}

main();
