define([
  "./meld.js",
  "d3-force",
  "@thi.ng/rstream",
  "@thi.ng/transducers",
  "@def.codes/dom-rules",
  "@def.codes/hdom-regions",
  "./examples/index.js",
  "./d3-driver.js",
  "./types.js",
  "./scanner.js",
  "./space.js",
], (_meld, d3, rs, tx, dom_rules, dp, examples, d3d, types, scanner, sp) => {
  // console.log("meld is", meld);
  // console.log("meld.foo is", meld.foo);

  const { TYPES } = types;
  const { operations_to_template } = dom_rules;
  const { box_simulation_node, force_from_description } = d3d;

  const has_type = (thing, type) =>
    thing.a === type || (Array.isArray(thing.a) && thing.a.includes(type));

  const trap_map = () => {
    const map = new Map();
    const has = key => map.has(key);
    const get = key => map.get(key);
    const set = (key, value) => map.set(key, value);
    return { has, get, set };
  };

  const random_point = () => ({
    x: Math.random() * 1000 - 500,
    y: Math.random() * 1000 - 500,
  });

  function* scan(spec, path = []) {
    console.groupCollapsed(`${path.join(" / ")}`);
    yield* scan_impl(spec, path);
    console.groupEnd();
  }

  function* scan_impl(spec, path = []) {
    if (typeof spec !== "object") {
      // console.warn(`spec of type ${typeof spec} is not supported! ${spec}`);
      return;
    }

    // Recur into arrays
    if (Array.isArray(spec)) {
      let i = 0;
      for (const item of spec) yield* scan(item, [...path, i++]);
      return;
    }

    const { a, ...props } = spec;

    const id = path.join(".");
    const name = path[path.length - 1];
    // Would rather something like
    // return { dom: { matches: `[id="${id}"]` } };
    // return { dom: { matches: `[name="${name}"]` } };
    yield* [
      ["dom-assert", id, { type: "attribute-equals", name: "id", value: id }],
      [
        "dom-assert",
        id,
        { type: "attribute-equals", name: "name", value: name },
      ],
    ];

    // Type is the first line of defense
    if (a) {
      if (Array.isArray(a))
        for (const type of a) yield ["assert-type", id, type];
      else yield ["assert-type", id, a];
    } else {
      console.warn("no type in:", ...path, spec);
    }

    for (const [name, child_spec] of Object.entries(props)) {
      const child_path = [...path, name].join(".");
      yield ["dom-assert", id, { type: "contains", id: child_path }];
      yield* scan(child_spec, [...path, name]);
    }
  }

  function interpret(recipe) {
    const rules = [sp.scan_rule];
    const { scan_with } = scanner;
    for (const result of scan_with(recipe, rules)) {
      const [tag, stuff] = result;
      if (tag === "apply-rule") {
        const { path, result } = stuff;
        console.log(`path ${path} said`, result);
      } else {
        console.warn(`I don't know how to interpret ${tag} from scanner`);
      }
    }

    const root = document.getElementById("August-2020-space");

    const dom_process = dp.make_dom_process();
    dom_process.mounted.next({ id: "world", element: root });

    const dom_claims = {};
    const node_streams = {};
    const sims = {};

    const by_id = trap_map();

    function sink([tag, ...args]) {
      if (tag === "dom-assert") {
        const [id, claim] = args;
        if (claim.type === "is") {
          dom_claims[id] = [claim];
        } else {
          // FF actually runs this
          // (dom_claims[id] ??= []).push(claim);
          if (!dom_claims[id]) dom_claims[id] = [];
          dom_claims[id].push(claim);
        }
        // Could create a stream from this
        dom_process.define(id, operations_to_template(dom_claims[id]));
      } else if (tag === "css-assert") {
        try {
          const [claimant, selector, properties] = args;
          const css = `${selector} {
${Object.entries(properties)
  .map(([key, value]) => `${key}:${value};`)
  .join("\n")}
}`;
          // The first two of these don't need to be done each time on each assert
          const ass_id = `${claimant}.css-assertions`;
          sink(["dom-assert", claimant, { type: "contains", id: ass_id }]);
          sink(["dom-assert", ass_id, { type: "uses-element", name: "style" }]);
          sink(["dom-assert", ass_id, { type: "text-is", text: css }]);
        } catch (error) {
          console.log("Problem processing CSS assert");
        }
      } else if (tag === "assert-type") {
        const [id, type] = args;
        if (!type) throw new Error(`type assertion missing object`);

        const type_spec = TYPES[type];
        if (!type_spec) {
          console.warn("I don't know about this type of thing:", type);
        } else {
          // There should be multiple types, and types are live mixins
          // basically prototypes but with protocol composition
          // prototype_props = type_spec;
        }
        sink([
          "dom-assert",
          id,
          { type: "attribute-contains-word", name: "typeof", value: type },
        ]);
      } else {
        console.warn("no handler for", tag);
      }
    }

    for (const claim of scan(recipe, ["world"])) sink(claim);
  }

  // TODO: loader should get this at relative path--which works for define above
  require(["./modules/recipe.js"], ({ RECIPE }) => interpret(RECIPE));
});
