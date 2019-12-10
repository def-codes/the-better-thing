// towards a simple baseline for object graph notation
import * as tx from "@thi.ng/transducers";
// TODO: members_of shouldn't be in dot
import { members_of, NotationSpec } from "@def.codes/graphviz-format";
import { isPlainObject } from "@thi.ng/checks";
import { TraversalSpec } from "@def.codes/graphs";

type Primitive = boolean | number | string | symbol | bigint;

const identity = <T>(x: T): T => x;

const is_reference_type = (x: any): x is object =>
  x && (typeof x === "object" || typeof x === "function");

const is_primitive = (x: any): x is Primitive => !is_reference_type(x);

const is_leaf_object = (o: any) =>
  isPlainObject(o) && Object.values(o).every(is_primitive);

const get_function_name = (f: Function) => f.name || "(anonymous function)";

const make_indexer = (indices = new Map()) => (o: any) =>
  indices.get(o) ?? indices.set(o, indices.size).size - 1;

export const make_object_graph_traversal_spec = (
  id_of = make_indexer()
): TraversalSpec<number, any, any> => ({
  id_of,
  value_of: identity,
  moves_from: (_, thing: any) =>
    tx.map(
      // TS: inferring any[] instead of [any, any]
      ([key, value]) => [value, key] as [any, any],
      tx.filter(
        ([, value]) => is_reference_type(value),
        // TODO: shouldn't be in dot
        members_of(thing)
      )
    ),
});

export const object_graph_dot_notation_spec: NotationSpec<
  number,
  any,
  string | number
> = {
  describe_node(id, value) {
    if (value === null) return { label: "∅" };
    if (value === undefined) return { label: "⊥" };
    if (typeof value === "function")
      return { shape: "box3d", label: get_function_name(value) };

    if (Array.isArray(value))
      return {
        shape: "record",
        // tooltip: id.toString(),
        label: value.map((value, key) => [
          key,
          { key, value: is_primitive(value) ? (value || "").toString() : "" },
        ]),
      };

    // re globalThis... it has a strange prototype chain involving two
    // plain-looking objects.  But otherwise it is like an object.
    // should be visually distinguished in some way as root---but how?
    // if (isPlainObject(value) || value === globalThis)
    if (value && typeof value === "object")
      return {
        tooltip: id.toString(),
        shape: "record",
        ...(is_leaf_object(value)
          ? { style: "filled", color: "lightblue" }
          : {}),
        label: Object.entries(value).map(([key, value]) => [
          key,
          { key, value: is_primitive(value) ? (value || "").toString() : "" },
        ]),
      };

    if (value) return { label: typeof value + " other??" };
  },
  describe_edge([, , data]) {
    if (data != null)
      return {
        // This might be set graph-wide, or perhaps in a subgraph for pointers
        tailclip: false,
        dir: "both",
        arrowtail: "dot",
        tailport: `${data}:c`,
      };
  },
};
