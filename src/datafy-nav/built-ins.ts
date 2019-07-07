import * as all_built_ins from "./built-ins/index";

export const built_ins = all_built_ins;

/** Use all data implementations from this package for built-in types. */
export function apply_all_built_ins() {
  for (const apply of Object.values(all_built_ins)) apply();
}
