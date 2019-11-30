import * as Dot from "@def.codes/graphviz-format";
import {
  TraversalNode,
  TraversalMemberNode,
  is_value,
  is_reference_type,
  depth_first_walk,
  empty_traversal_state,
} from "./depth-first-walk";

const safe_tostring = (x: any) =>
  x === null ? "null" : x === undefined ? "undefined" : x.toString();

const is_member_node = (node: TraversalNode): node is TraversalMemberNode =>
  node !== null && "container" in node;

function* object_graph_to_dot_statements(
  roots: readonly object[],
  state = empty_traversal_state()
): IterableIterator<Dot.Statement> {
  for (const node of depth_first_walk(roots, state)) {
    let label: Dot.NodeLabel = "";
    // @ts-ignore: WIP
    let more = {};
    if (!is_reference_type(node.value)) {
      label = safe_tostring(node.value).substring(0, 50);
      if (/^http/.test(label as string))
        more = {
          href: node.value,
          fontcolor: "blue",
          target: "_blank",
        };
    } else if (Array.isArray(node.value))
      yield {
        type: "node",
        id: `n${node.index}`,
        attributes: {
          style: "filled",
          shape: "record",
          label: node.value.map((value, key) => [
            { key, value: key },
            ...(is_reference_type(value) ? [] : [safe_tostring(value)]),
          ]),
        },
      };
    // Blocking: don't treat as object, or nulls would get their own nodes.
    else if (node.value === null) {
      // But this never actually happens
      console.log("NULL!", node);
    } else if (typeof node.value === "object")
      yield {
        type: "node",
        id: `n${node.index}`,
        attributes: {
          shape: "Mrecord",
          label: Object.entries(node.value).map(([key, value]) => [
            { key, value: key },
            ...(is_reference_type(value) ? [] : [safe_tostring(value)]),
          ]),
        },
      };
    else if (typeof node.value === "function")
      yield {
        type: "node",
        id: `n${node.index}`,
        attributes: { label: safe_tostring(node.value) },
      };

    if (is_member_node(node))
      if (is_value(node.key) && is_reference_type(node.value))
        yield {
          type: "edge",
          from: { id: `n${node.container}`, port: node.key.value },
          to: `n${node.index}`,
        };
  }
}

export const object_graph_to_dot = (roots: readonly object[]): Dot.Graph => ({
  type: "graph",
  attributes: { rankdir: "LR" },
  directed: true,
  //node_attributes: { fillcolor: "#990000", style: "filled,rounded" },
  statements: [...object_graph_to_dot_statements(roots)],
});

// For composing into larger contexts.
export const object_graph_to_dot_subgraph = (
  roots: readonly object[],
  state = empty_traversal_state()
): Dot.Subgraph => ({
  type: "subgraph",
  statements: [...object_graph_to_dot_statements(roots, state)],
});
