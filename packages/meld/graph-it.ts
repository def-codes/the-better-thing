import { getInUnsafe } from "@thi.ng/paths";
import {
  Subgraph,
  object_graph_to_dot_subgraph,
  depth_first_walk,
  graph,
  empty_traversal_state,
  default_traversal_spec,
} from "@def.codes/graphviz-format";
import { dot_updater } from "@def.codes/node-web-presentation";

interface Sketch {
  path?: string; // supports a.b.c notation
  as?: "walk" | "dot" | "graph";
}

export const make_grapher = () => {
  const updater = dot_updater();

  return function graph_it(thing: any, view?: Sketch | Sketch[]) {
    if (!view)
      view = Object.keys(thing)
        .filter(key => key !== "view")
        .map(path => ({ path, as: "graph" }));

    const state = empty_traversal_state();
    const spec = default_traversal_spec();
    // const spec: LabeledSyncTraversalSpec = {
    //   id: x => x,
    //   links_from: x => [...members_of(x)].slice(0, 3),
    // };
    const options = { spec, state };

    const to_subgraph_special = (sketch: Sketch): Subgraph => {
      const value = sketch.path ? getInUnsafe(thing, sketch.path) : thing;
      const interpreter = sketch.as || "graph";

      if (interpreter === "walk")
        return object_graph_to_dot_subgraph(
          [...depth_first_walk([value])],
          options
        );

      if (interpreter === "dot")
        return object_graph_to_dot_subgraph(
          // if you were to override spec, I don't think you'd want to apply it here too...
          [object_graph_to_dot_subgraph([value], options)],
          options
        );

      if (interpreter === "graph")
        return object_graph_to_dot_subgraph([value], options);
    };

    const to_subgraph = (sketch: Sketch): Subgraph => ({
      ...to_subgraph_special(sketch),
      id: `cluster_${
        Array.isArray(sketch.path)
          ? sketch.path.join("_")
          : sketch.path
          ? sketch.path.replace(".", "_")
          : "anon"
      }`,
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
    updater.go(g, false); // trace
  };
};
