import { Graph, Subgraph } from "./api";

// Just making something up
export const GRAPH_TYPE = "http://graphviz.org/doc/info#Graph";

// We don't attempt to detect type if `@type` doesn't indicate it.
export const is_graph = (x: any): x is Graph =>
  x != null && x["@type"] === GRAPH_TYPE;

export const graph = (spec: Partial<Graph>): Graph => ({
  "@type": GRAPH_TYPE,
  type: "graph",
  ...spec,
});

export const subgraph = (spec: Partial<Subgraph>): Subgraph => ({
  // Should be a separate type for this?
  "@type": GRAPH_TYPE,
  type: "subgraph",
  ...spec,
});
