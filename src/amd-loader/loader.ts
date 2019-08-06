import { AMDFactory } from "./api";
import { AsyncMap } from "./AsyncMap";
import { load_script } from "./load_script";

interface ModuleContext {
  readonly given_name: string | undefined;
  readonly dependencies: readonly string[];
  readonly factory: AMDFactory;
}

interface ModuleWithContext {
  readonly context?: ModuleContext;
  readonly module: any;
}

const default_resolver = (name: string, base: string | null | undefined) => {
  if (/^(\w+:)|\/\//.test(name)) return name;
  if (/^[.]{0,2}\//.test(name))
    return new URL(name, base == null ? location.href : base).href;

  return name;
};

export const make_loader = () => {
  const stack = [];

  function require_from(resolver) {
    const modules = new AsyncMap<string, ModuleWithContext>();

    const require_absolute = (url: string): Promise<ModuleWithContext> => {
      if (modules.has(url)) return modules.get(url);

      return load_script(url).then(async () => {
        // This `pop` is used to coordinate with the script.  The flow from a
        // script's execution context to its `onload` handler (and hence to
        // this) is synchronous, so this script's `define` should have been the
        // last one executed.
        if (!stack.length) throw Error(`Expected a define for ${url}`);
        const { context, promise } = stack.pop();
        const result = promise(require_relative(url));
        const module = await result;
        modules.set(url, { context, module });
        return { module };
      });
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

  const require = require_from(default_resolver);

  const define = (a, b, c) => {
    const [given_name, needs, factory] =
      typeof a === "string" ? [a, b, c] : [undefined, a, b];

    stack.push({
      context: { given_name, needs, factory },
      promise: require =>
        Promise.all(needs.map(require)).then(imports => factory(...imports)),
    });
  };

  return { require, define };
};
