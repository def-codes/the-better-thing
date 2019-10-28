// This is not isomorphic to the Dot language because it hoists all general
// attributes, whose declaration order, at least insofar as they are interleaved
// with other statements, does not matter.  Also doesn't include HTML labels.
export type CompassPoint =
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "nw"
  | "c"
  | "_";

export type NodeId =
  | string
  | { id: string; port: string; compass?: CompassPoint };

export type Statement = Node | Edge | Subgraph;

export type StatementList = Array<Statement>;

export interface GraphBase {
  id?: string;
  graph_attributes?: GraphAttributes;
  node_attributes?: Partial<NodeAttributes>;
  edge_attributes?: Partial<EdgeAttributes>;
  attributes?: GraphAttributes;
  statements?: StatementList;
}

export interface Graph extends GraphBase {
  type: "graph";
  strict?: boolean;
  directed?: boolean;
}

export interface Subgraph extends GraphBase {
  type: "subgraph";
}

export interface Node {
  type: "node";
  id: NodeId;
  attributes?: NodeAttributes;
}

export interface Edge {
  type: "edge";
  from: NodeId | Subgraph;
  to: NodeId | Subgraph;
  attributes?: EdgeAttributes;
}

// I may or may not spec out the values for these
// https://www.graphviz.org/doc/info/attrs.html

export interface KeyedRecordField {
  key: string | number;
  // You cannot key a set of fields, i.e. `<id> { p | q }` doesn't work.
  value: string | number;
}

// Could use object for field sets where all have keys, though you'd have
// ambiguity with `KeyedRecordField`.
//
//export interface KeyedRecordFields {}

export interface RecordFields extends Array<RecordLabel> {}

export type RecordLabel = string | number | KeyedRecordField | RecordFields;

export type NodeLabel = string | number | RecordLabel; // Or HtmlLikeLabel (TBD)

export interface GraphAttributes {
  [key: string]: string | number;
}

export interface NodeAttributes {
  label: NodeLabel;
  // Allowing `object` here so that label doesn't contradict it.  Ultimately,
  // I'll probably define the recognized values outright.
  [key: string]: string | number | object;
}

export interface EdgeAttributes {
  [key: string]: string | number;
}

export interface SubgraphAttributes {
  [key: string]: string | number;
}

export interface SerializeOptions {
  directed?: boolean;
  indent?: boolean;
}
