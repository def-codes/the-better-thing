/** A temporary thing to let module control what is presented. */
//import { path } from "../object/path";
//import { serialize_dot } from "../graphviz/serialize";
import {
  TraversalNode,
  is_reference_type,
  members_of,
} from "./general-object-to-graphviz";
import { sequence } from "mindgrub";
import { has_items } from "@def.codes/helpers";
const { take, repeatedly } = sequence;

// @ts-ignore: WIP
function* depth_first_walk_new(start: any): IterableIterator<TraversalNode> {
  const indices = new Map<object, number>();
  const index_of = (o: object) =>
    indices.has(o)
      ? (indices.get(o) as number)
      : indices.set(o, indices.size + 1).size;
  const traversed = new Set();

  const queue: TraversalNode[] = [{ value: start, index: 0 }];
  yield* queue;
  while (has_items(queue)) {
    const node = queue.pop();
    if (node && is_reference_type(node.value) && !traversed.has(node.value))
      for (const [key, value] of members_of(node.value)) {
        // Keys that are themselves objects get their own nodes.
        const is_reference_key = is_reference_type(key);
        if (is_reference_key) queue.push({ value: key, index: index_of(key) });

        if (is_reference_type(value))
          queue.push({
            value,
            container: node.index,
            index: index_of(value),
            key: is_reference_key
              ? { reference: index_of(key) }
              : { value: key },
          });
        // yield now if it's a value type.  this way you don't create a
        // needlessly large queue for large iterables.
        //
        // What should index be here?  Primitive values won't be unique in the
        // map.
        else yield { value, container: node.index, key, parent: node.value };
      }
    traversed.add(node.value);
  }
}

const random = Math.random;
const randoms = repeatedly(random);
//const some_function = x => x * x * x * x * x;
//const some_other_function = x => x * x;

// @ts-ignore: WIP
interface MemberBase {
  /** Reference to another node by its index in a traversal. */
  parent: number;
  /** Value of (or reference to) a node in a POJO traversal. */
  value: any;
}

/** A non-decomposable value.  Leaf node in traversal graph (i.e. no outbound
 * edges).  Not strictly speaking if you use it for e.g. Date... but I don't
 * want to treat those like other objects. */
// interface SomethingAtomic extends MemberBase {
//   type: "atomic";
// }

/** String-keyed map with O(1) lookup. Ignores prototype chain. */
// object

/** Iterable with O(1) indexed lookup. Probably nonsense for sparse arrays. */
// array

/** Dynamic (non-materialized) sequence based on iteration protocol. */
// iterable

/** Unique collection with O(1) equals-based membership test. Preserves
 * insertion order. */
// set

// @ts-ignore: WIP
type ValueType = boolean | number | symbol | string;

/** Represent a member and a link to containing collection in the context of a
 * unique (i.e. non-cyclic) traversal. Essentially represent an edge in a
 * JavaScript object graph. */

// @ts-ignore: WIP
function* path_keys_of(o: object) {
  // Or could use `range` here
  if (Array.isArray(o)) for (let i = 0; i < o.length; i++) yield i;
  else yield* Object.keys(o);
}

// @ts-ignore: WIP
interface T {
  container: number;
  sequence: number;
}

export const reflect = () => ({
  as_record: (function() {
    const as_record = (key, items) =>
      `<f${key}>` + items.map(_ => _.toString()).join(" | ");

    const CASES = [
      ["words", ["happy", "go", "lucky"]],
      ["dogs", ["mutt", "bow", "wow"]],
    ];
    return CASES.map(([key, items]) => as_record(key, items));
  })(),
  //d: ["once upon a <b>time</b>"],
  foor: Math.pow(2, 19),
  //graph_of_EXAMPLE_OBJECT: dot.serialize_dot(objdot),
  //fn: repeatedly.toString(),
  nums: Array.from(take(1, randoms())),
  //graph: dot.serialize_dot(EXAMPLE),
  //graph: dot.serialize_dot(object_graph_to_dot(dfw)),
  randomness: Math.random(),
  //foo: some_function(6),
  //EXAMPLE_OBJECT,
  //objdot,
});
