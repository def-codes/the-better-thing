import * as fs from "fs";
import * as path from "path";
import { read } from "@def.codes/expression-reader";
import {
  Subgraph,
  object_graph_to_dot_subgraph,
  depth_first_walk,
  graph,
} from "@def.codes/graphviz-format";
import { dot_updater } from "@def.codes/node-web-presentation";
import { filesystem_watcher_source } from "@def.codes/process-trees";
import { getIn } from "@thi.ng/paths";
import * as rs from "@thi.ng/rstream";
import { interpret } from "./interpreter";

// HELPER
/** Flatten an array to one level. */
export const flatten = <T>(arrays: readonly (readonly T[])[]): readonly T[] =>
  Array.prototype.concat(...arrays);

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

interface Sketch {
  path?: string; // supports a.b.c notation
  as?: "walk" | "dot" | "graph";
}

async function main() {
  const [, , module_name, op = "interpret"] = process.argv;
  const filename = path.join(process.cwd(), `${module_name}.js`);
  const context = {};

  if (!fs.existsSync(filename)) {
    console.error(`No such module ${module_name}`);
    process.exit(0);
  }

  const updater = dot_updater();

  function graph_it(thing: any, view?: Sketch | Sketch[]) {
    if (!view)
      view = Object.keys(thing)
        .filter(key => key !== "view")
        .map(path => ({ path, as: "graph" }));

    const to_subgraph_special = (sketch: Sketch): Subgraph => {
      const value = sketch.path ? getIn(thing, sketch.path) : thing;
      const interpreter = sketch.as || "graph";

      if (interpreter === "walk")
        return object_graph_to_dot_subgraph(depth_first_walk(value));

      if (interpreter === "dot")
        return object_graph_to_dot_subgraph(
          object_graph_to_dot_subgraph(value)
        );

      if (interpreter === "graph") return object_graph_to_dot_subgraph(value);
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
    const code = fs.readFileSync(filename, "utf8");

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

  function show_exports() {
    let exported;
    try {
      delete require.cache[require.resolve(filename)];
      exported = require(filename);
      // console.log(`exported`, exported);
    } catch (error) {
      exported = { error, when: "loading-code" };
    }

    graph_it(exported, exported.view);
  }

  // Watch
  await timeout(1000);
  const fn = op === "exports" ? show_exports : do_interpret;
  rs.stream(filesystem_watcher_source(filename)).subscribe({
    next: msg => {
      if (msg.type === "change") fn();
    },
  });

  fn();
}

main();
