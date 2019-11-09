// This is not isomorphic to the Dot language because it hoists all general
// attributes, whose declaration order, at least insofar as they are interleaved
// with other statements, does not matter.  Also doesn't include HTML labels.

import { ATTRIBUTES_METADATA } from "./attributes-metadata";

// Not currently used
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

// TODO: special serialize for the "List" types
// TODO: finish adding notes and specializing types
// TODO: include "string" on all types? to provide directly
// TODO: can support completion for strings where only *some* values are known?
export interface AttributeTypes {
  addDouble: number;

  addPoint: string | AttributeTypes["point"];

  /** box crow curve diamond dot icurve inv none normal tee vee */
  arrowType: string;

  bool: boolean | "true" | "false";

  clusterMode: "local" | "global" | "none";

  color: string;

  /** A colon-separated list of weighted color values: WC(:WC)* where each WC
   * has the form C(;F)? with C a color value and the optional F a
   * floating-point number, 0 ≤ F ≤ 1. The sum of the floating-point numbers in
   * a colorList must sum to at most 1. */
  colorList: string | AttributeTypes["color"][];

  dirType: "forward" | "back" | "both" | "none";

  double: number;

  /** A colon-separated list of doubles: "%f(:%f)*" where each %f is a
   * double.  */
  doubleList: string | AttributeTypes["double"][];

  escString: string;

  int: number;

  layerList: string | string[];

  layerRange: string | string[];

  // Technically NodeLabel should only apply for nodes
  lblString: string | NodeLabel; // Or HtmlLikeLabel (TBD)

  outputMode: "breadthfirst" | "nodesfirst" | "edgesfirst";

  /** "node", "clust" , "graph" , "array(_flags)?(%d)?"  */
  packMode: string;

  pagedir: "BL" | "BR" | "TL" | "TR" | "RB" | "RT" | "LB" | "LT";

  /** "%f,%f('!')?" representing the point (x,y). The optional '!' indicates the
   * node position should not change (input-only).
   *
   * If dim is 3, point may also have the format "%f,%f,%f('!')?" to represent
   * the point (x,y,z).  */
  point: string;

  pointList: string; // | AttributeTypes['point'][];

  portPos: string; // CompassPoint but also composites

  quadType: "normal" | "fast" | "none";

  rankType: "same" | "min" | "source" | "max" | "sink";

  rankdir: "TB" | "LR" | "BT" | "RL";

  rect: string;

  shape: string;

  smoothType:
    | "none"
    | "avg_dist"
    | "graph_dist"
    | "power_dist"
    | "rng"
    | "spring"
    | "triangle";

  splineType: string;

  startType: string;

  string: string;

  style: string;

  viewPort: string;
}

type Meta = typeof ATTRIBUTES_METADATA;

type ArrayItemType<T> = T extends ReadonlyArray<infer E> ? E : never;

// Sub-conditional is a trick to make type distribute over key
type FilterAttributes<
  T,
  K extends keyof Meta = keyof Meta
> = K extends (T extends ArrayItemType<Meta[K]["used_by"]>
? K
: never)
  ? K
  : never;

type UsedBy<T> = {
  // Make all optional
  [K in FilterAttributes<T>]?: AttributeTypes[ArrayItemType<Meta[K]["types"]>];
  // After all that, use this escape hatch so types are not strict.
  // The special attribute types are really a guide for interactive use.
  // TS: Shouldn't be `object` but test cases blow up compiler without it.
} & { [key: string]: string | number | object | any };

// Neat, but you don't get (JS) documentation on the resulting types.
export type NodeAttributes = UsedBy<"N">;
export type EdgeAttributes = UsedBy<"E">;
export type GraphAttributes = UsedBy<"G">;
export type SubgraphAttributes = UsedBy<"C">;

export interface SerializeOptions {
  directed?: boolean;
  indent?: boolean;
}
