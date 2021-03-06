// Extend a basic AMD implementation to support remote scripts and anonymous
// defines.  Unlike the basic module, this is browser-specific.
(function () {
  /** Load the script at a given URL (for its side-effects) and resolve when
   * complete (which will occur synchronously after the script has been executed).
   * Temporarily adds a script element to the document head. */
  const load_script = (url, doc = document) =>
    new Promise((resolve, reject) => {
      const script = doc.createElement("script");
      // Marker for use by other processors (not used here).
      script.setAttribute("data-is-temporary", "true");
      script.async = true;
      script.src = url;
      const remove = () => script.parentNode.removeChild(script);
      script.onload = () => (remove(), resolve());
      script.onerror = error => (remove(), reject(error));
      doc.head.appendChild(script);
    });

  const default_resolver = (name, base) => {
    // Add `.js` extension if not present
    if (!/[.]m?js($|[?#])/.test(name)) name += ".js";
    if (/^(\w+:)|[/][/]/.test(name)) return name;
    if (/^[.]{0,2}[/]/.test(name))
      return new URL(name, base == null ? location.href : base).href;

    return name;
  };

  const make_full_amd = (basic_amd, resolver) => {
    const anonymous_defines = [];

    // Fetch a script and associate its URL with its expected module definition.
    // `anonymous_defines` is taken from the enclosing context.  Resolved value
    // is undefined if the script didn't make any anonymous defines.  That is
    // not *necessarily* an error, if the module happens to make a named define
    // for the thing that was being required.
    async function fetch_module(url) {
      await load_script(url);
      if (anonymous_defines.length)
        // popping here is non-monotonic, but avoids incorrect association
        return { ...anonymous_defines.pop(), url };
    }

    const define = Object.assign(
      (...args) => {
        if (typeof args[0] === "string") basic_amd.define(...args);
        // Anonymous define!  Assume we're in a script being loaded.
        else {
          const src = document.currentScript && document.currentScript.src;
          anonymous_defines.push({
            args,
            // Okay, but this is going to be equal to url by the time it's read
            src: document.currentScript && document.currentScript.src,
          });
        }
      },
      // “To allow a clear indicator that a global define function (as needed
      // for script src browser loading) conforms to the AMD API, any global
      // define function SHOULD have a property called "amd" whose value is an
      // object.”
      // https://github.com/amdjs/amdjs-api/blob/master/AMD.md#defineamd-property-
      // Include `anonymous_defines` for visibility.
      { amd: { anonymous_defines } }
    );

    const SPECIAL_NAMES = ["exports", "require", "module"];

    // Ensure that we've initiated requests for all external dependencies,
    // transitively.
    const fetch_transitive = async (base, resolver, module_ids) => {
      for (const id of module_ids) {
        if (SPECIAL_NAMES.includes(id)) continue;

        // Don't do a remote request if we already have a definition.
        // Is this a good idea?  Depends on `definitions` being exposed.
        if (basic_amd.definitions.has(id)) continue;

        // Here we are resolving a dependency id *as originally written* to a
        // URL.  If this resolution can be done (or rather the necessary context
        // captured) at the time when the define occurs, then it should be done
        // then.  If it *can't*, that suggests that the same define can mean
        // different things (in terms of how *its* ids are resolved) may vary
        // based on where it's being requested from.  Is that the case?
        const url = resolver(id, base);
        let context;
        try {
          context = await fetch_module(url);
        } catch (error) {
          console.warn(`Couldn't load ${url} for ${id}`, error);
          continue;
        }
        if (!context) {
          // No context means that we didn't detect an anonymous define.  If
          // the module was not defined before but is defined now, then the
          // module used a named define.
          // TODO: still wrong if such a module had deps of its own, right?
          // TODO: restructure, this must be a bug wrt above `pop`
          if (!basic_amd.modules.has(id))
            console.warn(`No context for ${url} for ${id}`);
          continue;
        }
        // Use window.define to include any later wrapping.
        window.define(id, ...context.args);
        // Just defining it here doesn't trigger its factory.
        const [dependencies] = context.args;
        fetch_transitive(url, resolver, dependencies);
      }
    };

    // Basic require will wait for dependencies to be resolved, but doesn't do
    // anything to resolve them.  This initiates requests for remote scripts.
    const require_from = (base, resolver = default_resolver) => (...args) => {
      const [dependencies] = args;
      fetch_transitive(base, resolver, dependencies);
      basic_amd.require(...args);
    };

    return { define, require: require_from(null, resolver) };
  };

  window["@def.codes/amd-loader"] = { make_full_amd, default_resolver };
})();
