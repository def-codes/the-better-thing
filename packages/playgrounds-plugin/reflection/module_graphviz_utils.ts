import { DependencyGraph } from "./typescript_module_graph";

/** “Universal” functions for rendering module graphs in GraphViz format.
 *
 * Assumes module graphs are in the format returned by `dependency_grapher`
 * Which should be a fairly general graph format, anyway, maybe with a formatter.
 */

const dot_path_label = s => s.replace(/\//g, "\\n");

function* modules_digraph_lines_from(graph: DependencyGraph) {
  yield `layout=dot`;
  for (let key of Object.keys(graph))
    if (!/index$/.test(key))
      for (let dep of graph[key])
        yield `"${dot_path_label(key)}" -> "${dot_path_label(dep)}"`;
}

export const modules_to_digraph = graph =>
  [`digraph {`, ...modules_digraph_lines_from(graph), "}"].join("\n");
