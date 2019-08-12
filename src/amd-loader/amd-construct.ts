// The thing that you do *once you have* all of a module's resolved
// dependencies.  You need the names as well as the imports because some imports
// are treated specially.

// TODO: STUB need a way to do this
interface MinimalRequireContext {
  imports: object;
}
import { AMDRequire } from "./api";
const make_contextualized_require = (
  context: MinimalRequireContext
): AMDRequire => {
  return () => {};
};

import { ModuleDefinition } from "./types";
export function amd_construct(
  { needs, factory }: ModuleDefinition, // but without given name,
  context: MinimalRequireContext
) {
  const exports = {};
  const module = { exports };
  const require = make_contextualized_require(context);
  const special = { module, exports, require };
  const imports = needs.map(id => special[id] || context.imports[id]);

  // Run all this even if `exports` is used, for possible side-effects

  /** “If the factory argument is an object, that object should be assigned as
   * the exported value of the module.”
   * https://github.com/amdjs/amdjs-api/blob/master/AMD.md#factory- */
  const result = typeof factory === "function" ? factory(...imports) : factory;
  return needs.includes("exports") ? exports : result;
}
