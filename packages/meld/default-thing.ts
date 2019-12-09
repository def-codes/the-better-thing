// default thing to do when no export is specified
import { traverse, from_facts } from "@def.codes/graphs";
import * as dot from "@def.codes/graphviz-format";
import {
  make_display,
  make_object_graph_traversal_spec,
  object_graph_dot_notation_spec,
} from "@def.codes/node-web-presentation";

export const default_thing = (
  display: ReturnType<typeof make_display>,
  input = globalThis
) => {
  const traversed = [...traverse([input], make_object_graph_traversal_spec())];
  const constructed = from_facts(traversed);

  const graph = dot.graph({
    directed: true,
    attributes: { rankdir: "LR" },
    statements: [
      ...dot.statements_from_graph(constructed, object_graph_dot_notation_spec),
    ],
  });

  display.graph(graph);
};
