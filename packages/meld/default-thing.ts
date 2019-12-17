// default thing to do when no export is specified
import { traverse, from_facts, IGraph, GraphFact } from "@def.codes/graphs";
import * as dot from "@def.codes/graphviz-format";
import {
  make_display,
  make_object_graph_traversal_spec,
  object_graph_dot_notation_spec,
} from "@def.codes/node-web-presentation";

export const default_dot_graph = (
  display: ReturnType<typeof make_display>,
  dot_graph: dot.Graph
) => {
  display.graphviz(dot_graph);
};

export const default_dot_statements = (
  display: ReturnType<typeof make_display>,
  statements: dot.StatementList
) => {
  const dot_graph = dot.graph({
    directed: true,
    // Why?
    attributes: { rankdir: "LR" },
    statements,
  });
  default_dot_graph(display, dot_graph);
};

export const default_graph = (
  display: ReturnType<typeof make_display>,
  graph: IGraph<any, any, any>
) => {
  const statements = [
    ...dot.statements_from_graph(graph, object_graph_dot_notation_spec),
  ];
  default_dot_statements(display, statements);
};

export const default_facts = (
  display: ReturnType<typeof make_display>,
  facts: Iterable<GraphFact<string | number, any, any>>
) => {
  const constructed = from_facts(facts);
  default_graph(display, constructed);
};

export const default_thing = (
  display: ReturnType<typeof make_display>,
  input = globalThis
) => {
  const traversed = [...traverse([input], make_object_graph_traversal_spec())];
  default_facts(display, traversed);
};
