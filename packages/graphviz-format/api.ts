// This is not isomorphic to the Dot language because it hoists all general
// attributes, whose declaration order, at least insofar as they are interleaved
// with other statements, does not matter.  Also doesn't include HTML labels.

import { ATTRIBUTES_METADATA } from "./attributes-metadata";
import { TYPES } from "./vocabulary";

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
  | number
  | { id: string | number; port?: string; compass?: CompassPoint };

export type Statement = Node | Edge | Subgraph;

export type StatementList = readonly Statement[];

export interface GraphBase {
  "@type"?: typeof TYPES.GRAPH;
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
  /** A double with an optional prefix '+'.  */
  addDouble: string | number;

  /** A `point` with an optional prefix '+'.  */
  addPoint: string | AttributeTypes["point"];

  /** box crow curve diamond dot icurve inv none normal tee vee */
  arrowType: string;

  bool: boolean | "true" | "false";

  clusterMode: "local" | "global" | "none";

  /** Colors can be specified using one of four formats.
   * "#%2x%2x%2x"	Red-Green-Blue (RGB)
   * "#%2x%2x%2x%2x"	Red-Green-Blue-Alpha (RGBA)
   * "H[, ]+S[, ]+V"	Hue-Saturation-Value (HSV) 0.0 <= H,S,V <= 1.0
   * string	color name */
  color: string;

  /** A colon-separated list of weighted color values: WC(:WC)* where each WC
   * has the form C(;F)? with C a color value and the optional F a
   * floating-point number, 0 ≤ F ≤ 1. The sum of the floating-point numbers in
   * a colorList must sum to at most 1. */
  colorList: string | AttributeTypes["color"][];

  /** That is, a glyph is drawn at the head end of an edge if and only if
   * dirType is "forward" or "both"; a glyph is drawn at the tail end of an edge
   * if and only if dirType is "back" or "both";
   *
   * For undirected edges T -- H;, one of the nodes, usually the righthand one,
   * is treated as the head for the purpose of interpreting "forward" and
   * "back". */
  dirType: "forward" | "back" | "both" | "none";

  double: number;

  /** A colon-separated list of doubles: "%f(:%f)*" where each %f is a
   * double.  */
  doubleList: string | AttributeTypes["double"][];

  /** A string allowing escape sequences which are replaced according to the
   * context. For node attributes, the substring "\N" is replaced by the name of
   * the node, and the substring "\G" by the name of the graph. For graph or
   * cluster attributes, the substring "\G" is replaced by the name of the graph
   * or cluster. For edge attributes, the substring "\E" is replaced by the name
   * of the edge, the substring "\G" is replaced by the name of the graph or
   * cluster, and the substrings "\T" and "\H" by the names of the tail and head
   * nodes, respectively. The name of an edge is the string formed from the name
   * of the tail node, the appropriate edge operator ("--" or "->") and the name
   * of the head node. In all cases, the substring "\L" is replaced by the
   * object's label attribute.
   *
   * In addition, if the associated attribute is `label`, `headlabel` or
   * `taillabel`, the escape sequences "\n", "\l" and "\r" divide the label into
   * lines, centered, left-justified, and right-justified, respectively.
   *
   * Obviously, one can use "\\" to get a single backslash. A backslash
   * appearing before any character not listed above is ignored. */
  escString: string;

  int: number;

  /** list of strings separated by characters from the layersep attribute (by
   * default, colons, tabs or spaces), defining layer names and implicitly
   * numbered 1,2,...  */
  layerList: string | string[];

  /** specifies a list of layers defined by the `layers` attribute. It consists
   * of a list of layer intervals separated by any collection of characters from
   * the `layerlistsep` attribute. Each layer interval is specified as either a
   * layerId or a layerIdslayerId, where layerId = "all", a decimal integer or a
   * `layer` name. (An integer i corresponds to layer i, layers being numbered
   * from 1.) The string **s** consists of 1 or more separator characters
   * specified by the `layersep` attribute.
   *
   * Thus, assuming the default values for `layersep` and `layerlistsep`, if
   * `layers="a:b:c:d:e:f:g:h"`, the layerRange string `layers="a:b,d,f:all"`
   * would denote the layers `a b d f g h`.  */
  layerRange: string | string[];

  // Technically NodeLabel should only apply for nodes
  lblString: string | NodeLabel; // Or HtmlLikeLabel (TBD)

  /** These specify the order in which nodes and edges are drawn in concrete
   * output. The default "breadthfirst" is the simplest, but when the graph layout
   * does not avoid edge-node overlap, this mode will sometimes have edges drawn
   * over nodes and sometimes on top of nodes. If the mode "nodesfirst" is chosen,
   * all nodes are drawn first, followed by the edges. This guarantees an
   * edge-node overlap will not be mistaken for an edge ending at a node. On the
   * other hand, usually for aesthetic reasons, it may be desirable that all edges
   * appear beneath nodes, even if the resulting drawing is ambiguous. This can be
   * achieved by choosing "edgesfirst".  */
  outputMode: "breadthfirst" | "nodesfirst" | "edgesfirst";

  /** "node", "clust" , "graph" , "array(_flags)?(%d)?"  */
  packMode: string;

  /**  These specify the 8 row or column major orders for traversing a
   *  rectangular array, the first character corresponding to the major order
   *  and the second to the minor order. Thus, for "BL", the major order is from
   *  bottom to top, and the minor order is from left to right. This means the
   *  bottom row is traversed first, from left to right, then the next row up,
   *  from left to right, and so on, until the topmost row is traversed.  */
  pagedir: "BL" | "BR" | "TL" | "TR" | "RB" | "RT" | "LB" | "LT";

  /** "%f,%f('!')?" representing the point (x,y). The optional '!' indicates the
   * node position should not change (input-only).
   *
   * If dim is 3, point may also have the format "%f,%f,%f('!')?" to represent
   * the point (x,y,z).  */
  point: string;

  pointList: string; // | AttributeTypes['point'][];

  /** modifier indicating where on a node an edge should be aimed. It has the
   * form `portname(:compass_point)?` or *compass_point*. If the first form is
   * used, the corresponding node must either have record shape with one of its
   * fields having the given portname, or have an HTML-like label, one of whose
   * components has a `PORT` attribute set to *portname*.
   *
   * If a compass point is used, it must have the form
   * `"n","ne","e","se","s","sw","w","nw","c","_"`. This modifies the edge
   * placement to aim for the corresponding compass point on the port or, in the
   * second form where no *portname* is supplied, on the node itself. The
   * compass point "c" specifies the center of the node or port. The compass
   * point "_" specifies that an appropriate side of the port adjacent to the
   * exterior of the node should be used, if such exists. Otherwise, the center
   * is used. If no compass point is used with a portname, the default value is
   * "_".  */
  portPos: string; // CompassPoint but also composites

  /** Using "fast" gives about a 2-4 times overall speedup compared with
   * "normal", though layout quality can suffer a little.  */
  quadType: "normal" | "fast" | "none";

  rankType: "same" | "min" | "source" | "max" | "sink";

  /** corresponding to directed graphs drawn from top to bottom, from left to
   * right, from bottom to top, and from right to left, respectively.  */
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
