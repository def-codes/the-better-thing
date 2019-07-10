import * as tx from "@thi.ng/transducers";
import { Predicate, Fn } from "@thi.ng/api";
import { LinkedList } from "./linked-list";

/** General depth-first search with linked-list paths. */
export function* depth_first_search<T>(
  start_with: Iterable<T>,
  get_moves: Fn<LinkedList<T>, Iterable<T>>,
  keep_going: Predicate<LinkedList<T>>
): IterableIterator<LinkedList<T>> {
  const queue = [...tx.map(x => new LinkedList(x), start_with)];
  while (queue.length > 0) {
    const path = queue.pop();
    yield path;
    if (keep_going(path))
      queue.push(...tx.map(next => path.cons(next), get_moves(path)));
  }
}
