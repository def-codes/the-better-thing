// configure and extend require
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
  Object.assign(window, {
    define: Object.assign((...args) => {
      let id, deps, fact;
      if (typeof args[0] === "string") {
        if (args.length === 2) [id, fact] = args;
        else [id, deps, fact] = args;
      } else {
        if (args.length === 1) [fact] = args;
        else [deps, fact] = args;
      }
      const desc = [];
      desc.push(id ? `defining <code>${id}</code>` : "anonymous define");
      desc.push(
        deps
          ? `depending on <code>${JSON.stringify(deps)}</code>`
          : `with no dependencies`
      );

      desc.push(
        "run in " +
          (document.currentScript ? document.currentScript.src : "top")
      );
      //desc.push(`with factory <code>${fact}</code>`);
      if (id)
        document
          .getElementById("definitions")
          .appendChild(
            document.createElement("div")
          ).innerHTML = `<dt>${id}</dt><dd>${desc.slice(1).join(" ")}</dd>`;

      document
        .getElementById("events")
        .appendChild(document.createElement("li")).innerHTML = desc.join(" ");
      return base.define(...args);
    }, base.define),
    require: (...args) => {
      const [deps, fact] = args;
      const desc = ["require"];
      desc.push(`<code>${JSON.stringify(deps)}</code>`);
      desc.push(
        "from " +
          ((document.currentScript && document.currentScript.src) || "top")
      );
      desc.push(`for <code>${fact}</code>`);
      document
        .getElementById("events")
        .appendChild(document.createElement("li")).innerHTML = desc.join(" ");

      return base.require(...args);
    },
  });
})();

// This *has* to be define even if there are no exports, it doesn't work with
// require when this is loaded as a dependency.
define(["./thing-one.js", "./thing-two.js"], (one, two) => {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! one", one);
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! two", two);
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ one.op", one.op());
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ two.op", two.op());
  require(["./lateral.js"], wut => ({ wut, penal: "colony" }));
});
