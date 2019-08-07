import { AMDFactory, AMDRequire, AMDDefineFunction, AMDGlobals } from "./api";
import { AsyncMap } from "./AsyncMap";
import { load_script } from "./load_script";

interface ModuleContext {
  readonly given_name: string | undefined;
  readonly needs: readonly string[];
  readonly factory: AMDFactory;
}

interface ModuleWithContext {
  readonly context?: ModuleContext;
  readonly module: any;
}

interface PendingModule {
  readonly context: ModuleContext;
  // Resolves to the module given a (possibly contextualized) require
  readonly promise: (require: AMDRequire) => Promise<any>;
}

/*

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
const default_resolver = (name: string, base: string | null | undefined) => {
  if (/^(\w+:)|\/\//.test(name)) return name;
  if (/^[.]{0,2}\//.test(name))
    return new URL(name, base == null ? location.href : base).href;

  return name;
};

export const make_loader = (resolver = default_resolver): AMDGlobals => {
  const stack: PendingModule[] = [];
  const modules = new AsyncMap<string, ModuleWithContext>();

  function require_from(resolver) {
    const require_absolute = async (
      url: string
    ): Promise<ModuleWithContext> => {
      if (modules.has(url)) return modules.get(url);

      await load_script(url);
      // The stack is used to coordinate with the script.  This should occur
      // synchronously after the script load, when its `define` should have been
      // the last one executed.
      if (!stack.length) throw Error(`Expected a define for ${url}`);
      const { context, promise } = stack.pop();
      const result = promise(require_relative(url));
      const module = await result;

      // HERE
      //
      // This is the point at which the module and context are known.
      modules.set(url, { context, module });
      return { module };
    };

    const require_relative = base => name =>
      Promise.resolve(resolver(name, base))
        .then(require_absolute)
        .then(_ => _.module);

    const meet = (needs, factory) =>
      Promise.all(needs.map(require_relative(null))).then(
        imports => typeof factory === "function" && factory(...imports)
      );

    // side-effects only.  needs + factory or standalone factory
    return function require(a, b) {
      if (Array.isArray(a)) meet(a, b);
      else if (typeof a === "function") a();
    };
  }

  return {
    require: require_from(resolver),
    define: Object.assign(
      ((a, b, c) => {
        const [given_name, needs, factory] =
          typeof a === "string" ? [a, b, c] : [undefined, a, b];

        const promise = (require: AMDRequire) =>
          Promise.all(needs.map(require)).then(imports =>
            typeof factory === "function" ? factory(...imports) : factory
          );
        const context = { given_name, needs, factory };

        // It's possible for a define *not* to have been loaded by a separate
        // script.  In such cases, we expect the name to be present.  In
        // principle, the loading context would be that of the "current" script,
        // however, we have (to wit) no way to know that here.
        if (given_name)
          promise(require_from(default_resolver)).then(module =>
            modules.set(given_name, { context, module })
          );
        else stack.push({ context, promise });
      }) as AMDDefineFunction,
      { amd: {} }
    ),
  };
};
