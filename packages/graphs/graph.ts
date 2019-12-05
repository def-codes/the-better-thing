import { IGraph } from "./api";

export class Graph<ID, N, E> implements IGraph<ID, N, E> {
  _nodes: Map<ID, { value: N; edges: Map<ID, E> }> = new Map();

  [Symbol.iterator]() {
    return this.nodes();
  }

  *nodes() {
    yield* this._nodes.keys();
  }

  *nodes_with_data() {
    for (const [id, { value }] of this._nodes) yield [id, value] as [ID, N];
  }

  *edges() {
    for (const [subject, { edges }] of this._nodes)
      for (const [object, data] of edges)
        yield [subject, object, data] as [ID, ID, E];
  }

  *facts() {
    for (const [subject, { value, edges }] of this._nodes) {
      yield { subject, value };
      for (const [object, data] of edges) yield { subject, object, data };
    }
  }

  get_node(id: ID) {
    return this._nodes.get(id)?.value;
  }

  get_edge(from: ID, to: ID) {
    return this._nodes.get(from)?.edges.get(to);
  }

  *edges_from(subject: ID) {
    for (const [object, data] of this._nodes.get(subject)?.edges || [])
      yield [object, data] as [ID, E];
  }

  add_node(id: ID, value: N = undefined) {
    this._nodes.set(id, { value, edges: new Map() });
  }

  // Implicitly adds both source and target nodes if they don't exist.
  add_edge(from: ID, to: ID, data?: E) {
    if (!this._nodes.has(from)) this.add_node(from);
    if (!this._nodes.has(to)) this.add_node(to);
    this._nodes.get(from).edges.set(to, data);
  }

  delete_node(id: ID) {
    this._nodes.delete(id);
  }

  delete_edge(from: ID, to: ID) {
    this._nodes.get(from)?.edges.delete(to);
  }
}
