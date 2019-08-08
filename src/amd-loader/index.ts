export * from "./api";
export * from "./loader";

import { make_loader } from "./loader";
import { default_resolver } from "./name-resolution";

function main() {
  const paths = {};
  const mappings = {};

  const d3s = "dispatch force quadtree timer".split(" ");
  for (const name of d3s) paths[`d3-${name}`] = `/node_modules/d3-${name}/dist`;

  const things = "compare errors checks api equiv memoize strings compose transducers arrays dcons associative atom binary diff hiccup hdom interceptors paths random rstream rstream-dot rstream-query transducers-hdom defmulti hiccup-markdown fsm".split(
    " "
  );
  for (const thing of things)
    mappings[
      `@thi.ng/${thing}`
    ] = `/node_modules/@thi.ng/${thing}/lib/index.umd.js`;

  Object.assign(
    window,
    make_loader((name, base) => {
      if (mappings[name]) return mappings[name];
      if (paths[name]) name = paths[name];
      return default_resolver(name, base);
    })
  );
}

main();
