(function() {
  const { make_full_amd, default_resolver } = window["@def.codes/amd-loader"];

  // Special testing path config
  const res = (function() {
    const paths = {};
    const mappings = {};

    const d3s = "dispatch force quadtree timer".split(" ");
    for (const name of d3s)
      paths[`d3-${name}`] = `/node_modules/d3-${name}/dist`;

    const things = "compare errors checks api equiv memoize strings compose transducers arrays dcons associative atom binary diff hiccup hdom interceptors paths random rstream rstream-dot rstream-query transducers-hdom defmulti hiccup-markdown fsm".split(
      " "
    );
    for (const thing of things)
      mappings[
        `@thi.ng/${thing}`
      ] = `/node_modules/@thi.ng/${thing}/lib/index.umd.js`;

    return (name, base) => {
      if (mappings[name]) return mappings[name];
      if (paths[name]) name = paths[name];
      return default_resolver(name, base);
    };
  })();

  const base = make_full_amd(window["@def.codes/amd-basic"], res);
  Object.assign(window, base);
})();
