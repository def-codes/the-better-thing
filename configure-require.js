var requirejs = (function() {
  const paths = {};
  const mappings = {};

  const d3s = "dispatch force quadtree timer".split(" ");
  for (const name of d3s) paths[`d3-{name}`] = `/node_modules/d3-${name}/dist`;

  const things = "compare errors checks api equiv memoize strings compose transducers arrays dcons associative atom binary diff hiccup hdom interceptors paths random rstream rstream-dot rstream-query transducers-hdom defmulti hiccup-markdown fsm".split(
    " "
  );
  for (const thing of things)
    mappings[
      `@thi.ng/${thing}`
    ] = `/node_modules/@thi.ng/${thing}/lib/index.umd.js`;

  return { baseUrl: "/node_modules", paths, map: { "*": mappings } };
})();
