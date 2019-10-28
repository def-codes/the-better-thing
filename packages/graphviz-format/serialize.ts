import * as Dot from "./api";
import { assert_unreachable } from "./assert_unreachable";

const is_subgraph = (o: any): o is Dot.Subgraph => o && o.type === "subgraph";

const escape_string = (s: string) => s.toString().replace(/"/g, `\\"`);

type AttributeContext = "node" | "edge" | "graph" | "subgraph";

const BRACES = /[<>{}| ]/g;

// > Braces, vertical bars and angle brackets must be escaped with a backslash
// > character if you wish them to appear as a literal character. Spaces are
// > interpreted as separators between tokens, so they must be escaped if you
// > want spaces in the text.
//
// “Braces” evidently includes angle brackets.
const escape_field = (s: string | number) =>
  s
    .toString()
    .substring(0, 15)
    .replace(BRACES, "\\$&");

const keyed_record_field = (field: Dot.KeyedRecordField) =>
  `<${field.key}> ${escape_field(field.value)}`;

/** For labels that are inside of another label, i.e. not the topmost. */
const record_field = (field: Dot.RecordLabel) =>
  Array.isArray(field)
    ? `{ ${record_fields(field)} }`
    : typeof field === "object"
    ? keyed_record_field(field)
    : escape_field(field);

const record_fields = (fields: Dot.RecordFields): string =>
  fields.map(record_field).join(" | ");

const record_label = (value: Dot.RecordLabel) =>
  // The outermost array is not wrapped in braces.
  Array.isArray(value) ? record_fields(value) : record_field(value);

const serialize_attribute = (
  key: string,
  value: any,
  _context?: AttributeContext
) => {
  let item = value;
  // Should include `context === "node" &&` But context is only for the group,
  // so currently you don't know what item is being processed.
  if (key === "label") item = record_label(value);
  return `${key}="${escape_string(item)}"`;
};

function* serialize_attributes(attributes: {}, target?: AttributeContext) {
  yield `${target ? target + " " : " "}[`;
  for (let [key, value] of Object.entries(attributes))
    yield serialize_attribute(key, value, target);
  yield "]";
}

const serialize_node_id = (id: Dot.NodeId) =>
  typeof id === "string"
    ? `"${id}"`
    : `"${id.id}":${id.port}${id.compass ? ":" + id.compass : ""}`;

function* serialize_node(node: Dot.Node) {
  yield serialize_node_id(node.id);
  if (node.attributes) yield* serialize_attributes(node.attributes);
}

function* serialize_subgraph(
  subgraph: Dot.Subgraph,
  options?: Dot.SerializeOptions
): IterableIterator<string> {
  yield `subgraph ${subgraph.id ? subgraph.id + " " : ""}{\n`;
  if (subgraph.statements)
    yield* serialize_statements(subgraph.statements, options);
  yield "}";
}

function* serialize_edge_ref(
  ref: Dot.NodeId | Dot.Subgraph,
  options?: Dot.SerializeOptions
) {
  if (is_subgraph(ref)) yield* serialize_subgraph(ref, options);
  else yield serialize_node_id(ref);
}

function* serialize_edge(edge: Dot.Edge, options?: Dot.SerializeOptions) {
  yield* serialize_edge_ref(edge.from, options);
  yield options && options.directed ? " -> " : " -- ";
  yield* serialize_edge_ref(edge.to, options);
  if (edge.attributes) yield* serialize_attributes(edge.attributes);
}

function* serialize_statement(
  statement: Dot.Statement,
  options?: Dot.SerializeOptions
) {
  switch (statement.type) {
    case "node":
      yield* serialize_node(statement);
      yield ";\n";
      return;
    case "edge":
      yield* serialize_edge(statement, options);
      yield ";\n";
      return;
    case "subgraph":
      yield* serialize_subgraph(statement, options);
      yield ";\n";
      return;
  }

  assert_unreachable(statement, "dot statement");
}

function* serialize_statements(
  statements: Dot.StatementList,
  options?: Dot.SerializeOptions
) {
  for (const statement of statements)
    yield* serialize_statement(statement, options);
}

function* as_statement<T>(sequence: Iterable<T>) {
  yield* sequence;
  yield ";\n";
}

function* serialize_lines(graph: Dot.Graph, options?: Dot.SerializeOptions) {
  yield `${graph.strict ? "strict " : ""}${graph.directed ? "di" : ""}graph ${
    graph.id ? graph.id + " " : ""
  }{\n`;
  if (graph.attributes)
    for (let [key, value] of Object.entries(graph.attributes))
      yield* as_statement(serialize_attribute(key, value));

  // Are these effectively different than the graph's own attributes?
  if (graph.graph_attributes)
    yield* as_statement(serialize_attributes(graph.graph_attributes, "graph"));

  if (graph.node_attributes)
    yield* as_statement(serialize_attributes(graph.node_attributes, "node"));

  if (graph.edge_attributes)
    yield* as_statement(serialize_attributes(graph.edge_attributes, "edge"));

  if (graph.statements) yield* serialize_statements(graph.statements, options);
  yield "}";
}

export const serialize_dot = (
  graph: Dot.Graph,
  options?: Dot.SerializeOptions
) =>
  Array.from(
    serialize_lines(graph, { directed: graph.directed, ...options })
  ).join("");
