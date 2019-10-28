import * as Dot from "@def.codes/graphviz-format";
import { has_items } from "mindgrub";

/** Arbitrarily-keyed map with O(1) equals-based membership test and lookup. */

interface Value {
  value: any;
}
interface Reference {
  reference: number;
}
type ValueOrReference = Value | Reference;

// Every item (except the root) will also have something indicating its
// relationship to its parent.
interface TraversalRootItem {
  value: any;
  index?: number;
}
interface TraversalMemberNode extends TraversalRootItem {
  container: number;
  key: ValueOrReference;
  /** An actual runtime reference to the containing object. */
  parent: object;
}
export type TraversalNode = TraversalRootItem | TraversalMemberNode;

// Deal with JavaScript bug.
const is_object = (x): x is object => x !== null && typeof x === "object";

function* enumerate_members<T>(
  sequence: Iterable<T>
): IterableIterator<[number, T]> {
  let i = 0;
  for (const value of sequence) yield [i++, value];
}

export function members_of(o: object): Iterable<[any, any]> {
  if (o instanceof Map) return o.entries();
  // @ts-ignore: Guard doesn't convince TS it's an Iterable.
  if (Symbol.iterator in o) return enumerate_members(o);
  if (typeof o === "object") return Object.entries(o);
  console.warn("members_of: unsupported type", typeof o, o);
  return [];
}

export const is_reference_type = (value: any) =>
  value !== null && (typeof value === "object" || typeof value === "function");

export function* depth_first_walk(start: any): IterableIterator<TraversalNode> {
  const indices = new Map<object, number>();
  const index_of = (o: object) =>
    indices.has(o)
      ? (indices.get(o) as number)
      : indices.set(o, indices.size + 1).size;
  const traversed = new Set();

  const queue: TraversalNode[] = [{ value: start, index: 0 }];
  while (has_items(queue)) {
    const node = queue.pop();
    yield node;
    if (is_object(node.value) && !traversed.has(node.value))
      for (const [key, value] of members_of(node.value)) {
        const is_reference_key = is_reference_type(key);
        if (is_reference_key) queue.push({ value: key, index: index_of(key) });
        queue.push({
          value,
          index: index_of(value),
          key: is_reference_key ? { reference: index_of(key) } : { value: key },
          container: node.index,
        });
      }
    traversed.add(node.value);
  }
}

export const walk_object = o => Array.from(depth_first_walk(o));

const safe_tostring = x =>
  x === null ? "null" : x === undefined ? "undefined" : x.toString();

const is_member_node = (node: TraversalNode): node is TraversalMemberNode =>
  node !== null && "container" in node;

const is_value = (vr: ValueOrReference): vr is Value =>
  vr !== null && typeof vr === "object" && "value" in vr;

function* object_graph_to_dot_statements(
  o: any
): IterableIterator<Dot.Statement> {
  for (const node of depth_first_walk(o)) {
    let label: Dot.NodeLabel = "";
    // @ts-ignore: WIP
    let more = {};
    if (!is_reference_type(node.value)) {
      label = safe_tostring(node.value).substring(0, 50);
      if (/^http/.test(label as string))
        more = {
          href: node.value,
          fontcolor: "blue",
          target: "_blank",
        };
    } else if (Array.isArray(node.value))
      yield {
        type: "node",
        id: `n${node.index}`,
        attributes: {
          style: "filled",
          shape: "record",
          label: node.value.map((value, key) => [
            { key, value: key },
            ...(is_reference_type(value) ? [] : [safe_tostring(value)]),
          ]),
        },
      };
    // Blocking: don't treat as object, or nulls would get their own nodes.
    else if (node.value === null) {
      // But this never actually happens
      console.log("NULL!", node);
    } else if (typeof node.value === "object")
      yield {
        type: "node",
        id: `n${node.index}`,
        attributes: {
          shape: "Mrecord",
          label: Object.entries(node.value).map(([key, value]) => [
            { key, value: key },
            ...(is_reference_type(value) ? [] : [safe_tostring(value)]),
          ]),
        },
      };

    if (is_member_node(node))
      if (is_value(node.key) && is_object(node.value))
        yield {
          type: "edge",
          from: { id: `n${node.container}`, port: node.key.value },
          to: `n${node.index}`,
        };
  }
}

export const object_graph_to_dot = (o: any): Dot.Graph => ({
  type: "graph",
  attributes: { rankdir: "LR" },
  directed: true,
  //node_attributes: { fillcolor: "#990000", style: "filled,rounded" },
  statements: [...object_graph_to_dot_statements(o)],
});
