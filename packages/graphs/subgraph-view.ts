import { IGraphReader, IAdjacencyListReader } from "./api";

// Shorthand for this module
type IGraphView<ID, N, E> = IGraphReader<ID, N, E> &
  IAdjacencyListReader<ID, E>;

interface SubgraphViewOptions<ID, N, E> {
  node_predicate(value: N, id: ID): boolean;
  edge_predicate(data: E, from: ID, to: ID): boolean;
}

const TRUE = () => true;

// but should be read only
export class SubgraphView<ID, N, E> implements IGraphView<ID, N, E> {
  private readonly _graph: IGraphView<ID, N, E>;
  readonly node_predicate: (value: N, id: ID) => boolean;
  readonly edge_predicate: (data: E, from: ID, to: ID) => boolean;

  constructor(
    graph: IGraphView<ID, N, E>,
    options: Partial<SubgraphViewOptions<ID, N, E>>
  ) {
    this._graph = graph;
    this.node_predicate = options.node_predicate || TRUE;
    this.edge_predicate = options.edge_predicate || TRUE;
  }

  has(id: ID): boolean {
    return (
      this._graph.has(id) && this.node_predicate(this._graph.get_node(id), id)
    );
  }

  get_node(id: ID): N | undefined {
    if (this.has(id)) return this._graph.get_node(id);
  }

  get_edge(from: ID, to: ID): E | undefined {
    const data = this._graph.get_edge(from, to);
    if (this.has(from) && this.has(to) && this.edge_predicate(data, from, to))
      return data;
  }

  *nodes() {
    for (const [id, value] of this.nodes_with_data()) yield id;
  }

  *nodes_with_data() {
    for (const [id, value] of this._graph.nodes_with_data())
      if (this.node_predicate(value, id)) yield [id, value] as const;
  }

  *edges() {
    for (const edge of this._graph.edges()) {
      const [from, to, data] = edge;
      if (this.has(from) && this.has(to) && this.edge_predicate(data, from, to))
        yield edge;
    }
  }

  *edges_from(subject: ID) {
    if (this.has(subject))
      for (const edge of this._graph.edges_from(subject)) {
        const [neighbor, data] = edge;
        if (this.has(neighbor) && this.edge_predicate(data, subject, neighbor))
          yield edge;
      }
  }

  *adjacent(node: ID) {
    if (this.has(node))
      for (const edge of this._graph.adjacent(node)) {
        const [neighbor, data] = edge;
        if (this.has(neighbor) && this.edge_predicate(data, node, neighbor))
          yield edge;
      }
  }
}
