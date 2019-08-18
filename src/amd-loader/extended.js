// Extend a basic AMD implementation to support remote scripts and anonymous
// defines.

(function() {
  /** Load the script at a given URL (for its side-effects) and resolve when
   * complete (which will occur synchronously after the script has been executed).
   * Temporarily adds a script element to the document head. */
  // BROWSER-specific
  const load_script = (url, doc = document) =>
    new Promise((resolve, reject) => {
      const script = doc.createElement("script");
      script.async = true;
      script.src = url;
      const remove = () => script.parentNode.removeChild(script);
      script.onload = () => (remove(), resolve());
      script.onerror = error => (remove(), reject(error));
      doc.head.appendChild(script);
    });

  /*
http://wiki.commonjs.org/wiki/Modules/1.1.1#Module_Identifiers

1. A module identifier is a String of "terms" delimited by forward slashes.

2. A term must be a camelCase identifier, ".", or "..".

3. Module identifiers may not have file-name extensions like ".js".

4. Module identifiers may be "relative" or "top-level". A module identifier is
   "relative" if the first term is "." or "..".
*/
  const IS_RELATIVE = /^[.][.]?\//;
  const is_relative = id => IS_RELATIVE.test(id);

  /*
5. Top-level identifiers are resolved off the conceptual module name space root.

6. Relative identifiers are resolved relative to the identifier of the module in
   which "require" is written and called.
*/
  // BROWSER-specific
  const default_resolver = (name, base) => {
    console.log(`name, base`, name, base);

    if (/^(\w+:)|\/\//.test(name)) return name;
    if (/^[.]{0,2}\//.test(name))
      return new URL(name, base == null ? location.href : base).href;

    return name;
  };

  const make_full_amd = basic_amd => {
    const anonymous_defines = [];

    // Fetch a script and associate its URL with what should be its request context.
    // `anonymous_defines` is taken from the enclosing context.
    async function fetch_module(url) {
      await load_script(url);
      if (!anonymous_defines.length)
        throw Error(`Expected a define for ${url}`);
      // Note that we don't pop here, just use the last one.
      return { ...anonymous_defines[anonymous_defines.length - 1], url };
    }

    const define = Object.assign(
      (...args) => {
        if (typeof args[0] === "string") basic_amd.define(...args);
        // Anonymous define!  Assume we're in a script being loaded.
        else anonymous_defines.push({ args });
      },
      // “To allow a clear indicator that a global define function (as needed
      // for script src browser loading) conforms to the AMD API, any global
      // define function SHOULD have a property called "amd" whose value is an
      // object.”
      // https://github.com/amdjs/amdjs-api/blob/master/AMD.md#defineamd-property-
      // Include `anonymous_defines` for visibility.
      { amd: { anonymous_defines } }
    );

    // Must more or less entirely supersede the basic require, which will not
    // initiate any requests for remote scripts.
    const require = async (...args) => {
      const [dependencies] = args;
      dependencies.map(id => {
        // Don't do a remote request if we already have the module.
        // Is this a good idea?  Depends on `modules` being exposed.
        if (basic_amd.modules.has(id)) {
          console.log(id, "already defined as", basic_amd.modules.get(id));
          return;
        }

        const url = default_resolver(id);
        fetch_module(url)
          .catch(error => console.warn(`Couldn't load ${url} for ${id}`, error))
          .then(context => {
            basic_amd.define(id, ...context.args);
            // Just defining it here doesn't trigger its factory.
            require(...context.args);
          });
      });

      return basic_amd.require(...args);
    };

    return { define, require };
  };

  const base = make_full_amd(window["@def.codes/amd-basic"]);
  Object.assign(window, {
    define: Object.assign((...args) => {
      const result = base.define(...args);
      console.log(`DEFINE args, result`, args, result);
      return result;
    }, base.define),
    require: (...args) => {
      const result = base.require(...args);
      console.log(`REQUIRE args, result`, args, result);
      return result;
    },
  });
})();
