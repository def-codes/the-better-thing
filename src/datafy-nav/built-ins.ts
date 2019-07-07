import * as all_built_ins from "./built-ins/index";

export const built_ins: Record<
  string,
  { datafy?: Function; nav?: Function }
> = all_built_ins;

/** Use all data implementations from this package for built-in types. */
export function apply_all_built_ins() {
  for (const extend of Object.values(built_ins)) {
    if (extend.datafy) extend.datafy();
    if (extend.nav) extend.nav();
  }
}
