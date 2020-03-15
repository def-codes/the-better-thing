import * as fs from "fs";
import * as vm from "vm";
import * as rs from "@thi.ng/rstream";
import { IGraph, GraphFact } from "@def.codes/graphs";
import { module_graph_watcher } from "./graph-watcher/module-graph-watcher";
import * as dot from "@def.codes/graphviz-format";
import { make_display } from "@def.codes/node-web-presentation";
import {
  default_thing,
  default_things,
  default_graph,
  default_facts,
  default_dot_graph,
  default_dot_statements,
} from "./default-thing";

export async function module_host(
  module_name: string,
  op = "exports",
  state: object = {}
) {
  const nav_stack: { readonly href: string }[] = [];

  // transitional
  const display = Object.assign(make_display(), {
    thing: (thing: any) => default_thing(display, thing),
    things: (things: any) => default_things(display, things),
    facts: (facts: Iterable<GraphFact<string | number, any, any>>) =>
      default_facts(display, facts),
    graph: (graph: IGraph<any, any, any>) => default_graph(display, graph),
    dot_graph: (arg: dot.Graph) => default_dot_graph(display, arg),
    dot_statements: (arg: dot.StatementList) =>
      default_dot_statements(display, arg),
  });

  display.nav().subscribe({
    next: nav_event => {
      // This isn't really right, don't push for lateral navigation
      nav_stack.push(nav_event);
      console.log("NAVIGATED", nav_stack);
    },
  });

  // Not sure about including reference to state, just playing around
  const meld = { hosted_module: { name: module_name, state } };

  // const encountered_dependencies = new Set();
  const resolve_options = { paths: [process.cwd()] };
  const module_file = require.resolve(module_name, resolve_options);

  // Assume for now that we need the module file to exist up front.
  if (!fs.existsSync(module_file)) {
    console.error(`No such module ${module_name}`);
    process.exit(0);
  }

  /*
  const _require = (id: string) => {
    const resolved = require.resolve(id, resolve_options);
    encountered_dependencies.add(resolved);
    console.log(`encountered_dependencies`, encountered_dependencies);

    delete require.cache[resolved];
    return require(resolved);
  };

  const vm_context = vm.createContext({
    require: _require,
  });

  const fake_require = (_id: string) => {
    return vm.runInNewContext(`require("${module_name}")`, vm_context);
  };
  */
  Object.assign(globalThis, { state, display, meld });

  // This doesn't *have* to be an egress, but for the moment we're not
  // interested in exports.  That is, it's not a way that the module can use to
  // communicate with the system.  Rather, the module can import interpreters
  // directly.
  function show_exports() {
    let exported: any;
    try {
      // exported = fake_require(module_name);
      exported = require(module_file);
      if (exported && Object.keys(exported).length) {
        for (const [key, value] of Object.entries(exported)) {
          const thing = globalThis[key];
          if (thing)
            for (const [method, arg] of Object.entries(value))
              if (typeof thing[method] === "function") thing[method](arg);
        }
      } else {
        default_thing(display);
      }
    } catch (error) {
      console.log(`error`, error);

      exported = { error, when: "loading-code" };
    }
  }

  const watcher = module_graph_watcher(module_file);

  // watcher.any_invalidated.subscribe(rs.trace("INVALID!"));

  watcher.main_invalidated.subscribe({
    next() {
      show_exports();
    },
  });

  show_exports();
}
