import { GraphFact } from "./api";
import { has_items } from "@def.codes/helpers";

const EMPTY_ARRAY = [];
const DEFAULT_MOVES_FROM = () => EMPTY_ARRAY;
const DEFAULT_VALUE_OF = () => undefined;
const DEFAULT_ID_OF = <T>(x: T): T => x;

export interface TraversalSpec<ID, N, E> {
  id_of(node: any): ID;
  moves_from(id: ID, value: N | undefined): Iterable<[any, E]>;
  value_of(node: any): N | undefined;
}
export interface TraversalState<ID, N> {
  readonly queue: N[];
  readonly visited: Set<ID>;
}

export function* traverse<ID, N, E>(
  starts: Iterable<N>,
  spec: Partial<TraversalSpec<ID, N, E>>,
  state: Partial<TraversalState<ID, N>>
): IterableIterator<GraphFact<ID, N, E>> {
  const queue = state?.queue ?? [];
  const visited = state?.visited ?? new Set();
  const moves_from = spec?.moves_from ?? DEFAULT_MOVES_FROM;
  const value_of = spec?.value_of ?? DEFAULT_VALUE_OF;
  const id_of = spec?.id_of ?? (DEFAULT_ID_OF as (n: any) => ID);

  for (const start of starts) queue.push(start);

  while (has_items(queue)) {
    const raw = queue.pop();
    const subject = id_of(raw);
    const value = value_of(raw);
    // conditional yield?
    yield { subject, value };
    if (!visited.has(subject))
      for (const [o, data] of moves_from(subject, value)) {
        const object = id_of(o);
        yield { subject, object, data };
        queue.push(o);
      }
    visited.add(subject);
  }
}
