import * as Dot from "./api";
import { assert_unreachable } from "@def.codes/helpers";

const is_subgraph = (o: any): o is Dot.Subgraph => o && o.type === "subgraph";

const ALWAYS_ESCAPE = /["\\]/g;
const escape_string = (s: string) => s.replace(ALWAYS_ESCAPE, "\\$&");
const quoted_string = (s: string) => `"${escape_string(s)}"`;

type AttributeContext = "node" | "edge" | "graph" | "subgraph";

// > Braces, vertical bars and angle brackets must be escaped with a backslash
// > character if you wish them to appear as a literal character. Spaces are
// > interpreted as separators between tokens, so they must be escaped if you
// > want spaces in the text.
//
// “Braces” evidently includes angle brackets.  Note that characters that always
// require escaping must also be included here.  See note in
// `serialize_attributes`.
const FIELD_ESCAPE = /[<>{}| "\\]/g;
const escape_field_string = (s: string) => s.replace(FIELD_ESCAPE, "\\$&");

// Mainly to ensure that strings are not excessively long
const field_string = (s: string | number) =>
  escape_field_string(s.toString().substring(0, 50));

// Certain characters just cannot be used in fields id's.  The regexp includes
// the ones I've come across so far.  This can produce collisions in some keys,
// but leaving the characters in corrupts the label entirely.
const FIELD_DISALLOWED = /[:\\]/g;
const escape_field_key = (s: string | number) =>
  escape_field_string(s.toString().replace(FIELD_DISALLOWED, "_"));

const keyed_record_field = (field: Dot.KeyedRecordField) =>
  (field.key != null ? `<${escape_field_key(field.key)}> ` : "") +
  field_string(field.value);

/** For labels that are inside of another label, i.e. not the topmost. */
const record_field = (field: Dot.RecordLabel) =>
  Array.isArray(field)
    ? `{ ${record_fields(field)} }`
    : typeof field === "object"
    ? keyed_record_field(field)
    : field_string(field);

const record_fields = (fields: Dot.RecordFields): string =>
  fields.map(record_field).join(" | ");

// https://www.graphviz.org/doc/info/shapes.html#record
const record_label = (value: Dot.RecordLabel) =>
  // The outermost array is not wrapped in braces.
  Array.isArray(value) ? record_fields(value) : record_field(value);

const serialize_attribute = (
  key: string,
  value: unknown,
  _context?: AttributeContext
): string => {
  let item = value;
  if (item == null) return "";
  // Graphviz interprets label as record type whenever the node's shape is
  // Mrecord.  Even if we had access to the rest of the attributes object here
  // (which we could), we couldn't know what the *effective* shape will be,
  // since this node can have attributes elsewhere.  So if you want to use
  // literal strings for record-type labels, you have to escape it yourself.
  //
  // Also, this should only apply to nodes.  But we also don't know what type of
  // element this is for (`context` is only used for general attribute groups.)
  if (key === "label" && typeof value !== "string")
    // The variable parts of record labels are escaped individually.  So don't
    // double escape.
    return `label="${record_label(value as Dot.RecordLabel)}"`;
  return `${key}=${quoted_string(item.toString())}`;
};

function* serialize_attributes(
  attributes: object | undefined,
  target?: AttributeContext
) {
  if (attributes)
    // Ignore null or undefined because it's convenient for conditional expressions
    for (let [key, value] of Object.entries(attributes))
      if (value != null) yield serialize_attribute(key, value, target) + " ";
}

function* serialize_attribute_block(
  attributes: object | undefined,
  target?: AttributeContext
) {
  if (attributes) {
    yield (target || "") + " [";
    yield* serialize_attributes(attributes);
    yield "]";
  }
}

const serialize_node_id = (id: Dot.NodeId) =>
  typeof id === "string" || typeof id === "number"
    ? quoted_string(id.toString())
    : serialize_node_id(id.id) +
      (id.port == null ? "" : ":" + quoted_string(escape_field_key(id.port))) +
      (id.compass == null ? "" : ":" + id.compass);

function* serialize_node(node: Dot.Node) {
  yield serialize_node_id(node.id);
  yield* serialize_attribute_block(node.attributes);
}

// Serialize parts common to graph and subgraph
function* serialize_graph_common(
  graph: Dot.GraphBase,
  options?: Dot.SerializeOptions
) {
  yield* serialize_attributes(graph.attributes);
  yield* serialize_attribute_block(graph.graph_attributes, "graph");
  yield "\n";
  yield* serialize_attribute_block(graph.node_attributes, "node");
  yield "\n";
  yield* serialize_attribute_block(graph.edge_attributes, "edge");
  yield "\n";
  yield* serialize_statements(graph.statements, options);
}

function* serialize_subgraph(
  subgraph: Dot.Subgraph,
  options?: Dot.SerializeOptions
): IterableIterator<string> {
  yield "subgraph " + (subgraph.id ? '"' + subgraph.id + '" ' : "") + "{\n";
  yield* serialize_graph_common(subgraph, options);
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
  yield* serialize_attribute_block(edge.attributes);
}

function* serialize_statement(
  statement: Dot.Statement,
  options?: Dot.SerializeOptions
) {
  switch (statement.type) {
    case "node":
      yield* serialize_node(statement);
      break;
    case "edge":
      yield* serialize_edge(statement, options);
      break;
    case "subgraph":
      yield* serialize_subgraph(statement, options);
      break;
    default:
      assert_unreachable(statement, "dot statement");
  }

  yield "\n";
}

function* serialize_statements(
  statements: Dot.StatementList | undefined,
  options?: Dot.SerializeOptions
) {
  if (statements)
    for (const statement of statements)
      yield* serialize_statement(statement, options);
}

function* serialize_graph(graph: Dot.Graph, options?: Dot.SerializeOptions) {
  yield (graph.strict ? "strict " : "") +
    (graph.directed ? "digraph " : "graph ") +
    (graph.id ? graph.id + " " : "") +
    "{\n";
  yield* serialize_graph_common(graph, options);
  yield "}";
}

export const serialize_dot = (
  graph: Dot.Graph,
  options?: Dot.SerializeOptions
) =>
  Array.from(
    serialize_graph(graph, { directed: graph.directed, ...options })
  ).join("");
