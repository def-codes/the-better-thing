import { Graph, Subgraph } from "./api";

// Just making something up
export const DOT = "http://graphviz.org/doc/info#";
export const TYPES = {
  GRAPH: `${DOT}Graph`,
  NODE: `${DOT}Node`,
  EDGE: `${DOT}Edge`,
  CLUSTER: `${DOT}Cluster`,
  SUBGRAPH: `${DOT}Subgraph`,
};

// We don't attempt to detect type if `@type` doesn't indicate it.
export const is_graph = (x: any): x is Graph =>
  x != null && x["@type"] === TYPES.GRAPH;

export const graph = (spec: Partial<Graph>): Graph => ({
  "@type": TYPES.GRAPH,
  type: "graph",
  ...spec,
});

export const subgraph = (spec: Partial<Subgraph>): Subgraph => ({
  // Should be a separate type for this?
  "@type": TYPES.GRAPH,
  type: "subgraph",
  ...spec,
});
