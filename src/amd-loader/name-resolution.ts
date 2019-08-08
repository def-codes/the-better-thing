import { ModuleNameResolver } from "./types";

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

export const default_resolver: ModuleNameResolver = (
  name: string,
  base?: string | null
) => {
  console.log(`name, base`, name, base);

  if (/^(\w+:)|\/\//.test(name)) return name;
  if (/^[.]{0,2}\//.test(name))
    return new URL(name, base == null ? location.href : base).href;

  return name;
};
