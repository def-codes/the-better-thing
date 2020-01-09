import { IGraph, GraphFact, is_link } from "./api";

export class Graph<ID, N, E> implements IGraph<ID, N, E> {
  _nodes: Map<ID, { value: N; edges: Map<ID, E> }> = new Map();

  [Symbol.iterator]() {
    return this.nodes();
  }

  *nodes() {
    yield* this._nodes.keys();
  }

  *nodes_with_data() {
    for (const [id, { value }] of this._nodes) yield [id, value] as const;
  }

  *edges() {
    for (const [subject, { edges }] of this._nodes)
      for (const [object, data] of edges)
        yield [subject, object, data] as const;
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
      yield [object, data] as const;
  }

  *adjacent(node: ID) {
    for (const [s, o, e] of this.edges())
      if (s === node) yield [o, e] as const;
      else if (o === node) yield [s, e] as const;
  }

  // Also sets value on existing node with no value if one is provided now.
  add_node(id: ID, value?: N) {
    if (!this._nodes.has(id)) this._nodes.set(id, { value, edges: new Map() });
    else if (value !== undefined) {
      const { value: existing, edges } = this._nodes.get(id);
      if (existing === undefined) this._nodes.set(id, { value, edges });
    }
  }

  // Implicitly adds both source and target nodes if they don't exist.
  add_edge(from: ID, to: ID, data?: E) {
    this.add_node(from);
    this.add_node(to);
    this._nodes.get(from).edges.set(to, data);
  }

  delete_node(id: ID) {
    this._nodes.delete(id);
  }

  delete_edge(from: ID, to: ID) {
    this._nodes.get(from)?.edges.delete(to);
  }

  accept_fact(fact: GraphFact<ID, N, E>) {
    if (is_link(fact)) this.add_edge(fact.subject, fact.object, fact.data);
    else this.add_node(fact.subject, fact.value);
  }
}
