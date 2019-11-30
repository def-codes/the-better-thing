import * as fs from "fs";
import * as vm from "vm";
import * as path from "path";
import { read } from "@def.codes/expression-reader";
import {
  Subgraph,
  object_graph_to_dot_subgraph,
  depth_first_walk,
  empty_traversal_state,
  graph,
} from "@def.codes/graphviz-format";
import { dot_updater } from "@def.codes/node-web-presentation";
import { filesystem_watcher_source } from "@def.codes/process-trees";
import { getIn } from "@thi.ng/paths";
import * as rs from "@thi.ng/rstream";
import { interpret } from "./interpreter";

// HELPER
/** Flatten an array to one level. */
/* not used.  see also /playgrounds-plugin-client/dom/render.ts
export const flatten = <T>(arrays: readonly (readonly T[])[]): readonly T[] =>
  Array.prototype.concat(...arrays);
*/

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

interface Sketch {
  path?: string; // supports a.b.c notation
  as?: "walk" | "dot" | "graph";
}

async function main() {
  const [, , module_name, op = "interpret"] = process.argv;
  const resolve_options = { paths: [process.cwd()] };
  const module_file = require.resolve(module_name, resolve_options);
  const context = {};

  if (!fs.existsSync(module_file)) {
    console.error(`No such module ${module_name}`);
    process.exit(0);
  }

  const updater = dot_updater();

  function graph_it(thing: any, view?: Sketch | Sketch[]) {
    if (!view)
      view = Object.keys(thing)
        .filter(key => key !== "view")
        .map(path => ({ path, as: "graph" }));

    const state = empty_traversal_state();

    const to_subgraph_special = (sketch: Sketch): Subgraph => {
      const value = sketch.path ? getIn(thing, sketch.path) : thing;
      const interpreter = sketch.as || "graph";

      if (interpreter === "walk")
        return object_graph_to_dot_subgraph(
          [...depth_first_walk([value])],
          state
        );

      if (interpreter === "dot")
        return object_graph_to_dot_subgraph(
          [object_graph_to_dot_subgraph([value], state)],
          state
        );

      if (interpreter === "graph")
        return object_graph_to_dot_subgraph([value], state);
    };

    const to_subgraph = (sketch: Sketch): Subgraph => ({
      ...to_subgraph_special(sketch),
      id: `cluster_${sketch.path ? sketch.path.replace(".", "_") : "anon"}`,
      attributes: {
        label: sketch.path ?? "anon",
      },
    });

    const statements = (Array.isArray(view) ? view : [view]).map(to_subgraph);

    // Hold on just a little while longer...
    // console.log(`graph`, graph);
    // const dot = serialize_dot(graph);
    // console.log(`dot`, dot);
    // If you must do that ^ then just add as:`text` interpreter

    const g = graph({
      statements,
      directed: true,
      attributes: { rankdir: "LR" },
    });
    updater.go(g, true);
  }

  function do_interpret() {
    const code = fs.readFileSync(module_file, "utf8");

    let statements;
    try {
      // We *could* use a VM with a Proxy as context, but expression reader
      // isn't factored for that and this works fine.
      statements = read(code);
    } catch (error) {
      statements = { error, when: "reading-code" };
    }

    let result;
    try {
      result = interpret(statements, context);
    } catch (error) {
      result = { error, when: "interpreting-statements" };
    }

    graph_it({ statements, result });
  }

  const encountered_dependencies = new Set();

  const _require = id => {
    const resolved = require.resolve(id, resolve_options);
    encountered_dependencies.add(resolved);
    console.log(`encountered_dependencies`, encountered_dependencies);

    delete require.cache[resolved];
    return require(resolved);
  };

  const vm_context = vm.createContext({
    require: _require,
  });

  const fake_require = id => {
    return vm.runInNewContext(`require("${module_name}")`, vm_context);
  };

  function show_exports() {
    let exported;
    try {
      exported = fake_require(module_name);
    } catch (error) {
      console.log(`error`, error);

      exported = { error, when: "loading-code" };
    }

    graph_it(exported, exported.view);
  }

  // Watch
  await timeout(1000);
  const fn = op === "exports" ? show_exports : do_interpret;
  rs.stream(filesystem_watcher_source(module_file)).subscribe({
    next: msg => {
      if (msg.type === "change") fn();
    },
  });

  fn();
}

if (process.argv.includes("temp")) main();

export * from "./module-streams/index";
