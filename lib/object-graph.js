// towards a simple baseline for object graph notation
const tx = require("@thi.ng/transducers");
const dot = require("@def.codes/graphviz-format");
const { isPlainObject } = require("@thi.ng/checks");

const is_reference_type = x =>
  x && (typeof x === "object" || typeof x === "function");
const is_primitive = x => !is_reference_type(x);
const is_leaf_object = o =>
  isPlainObject(o) && Object.values(o).every(is_primitive);

const make_indexer = (indices = new Map()) => o =>
  indices.get(o) || /* ?? */ indices.set(o, indices.size).size - 1;

exports.make_walk_object_spec = (id_of = make_indexer()) => ({
  id_of,
  value_of: x => x,
  moves_from: (_, thing) =>
    tx.map(
      ([key, value]) => [value, key],
      tx.filter(
        ([, value]) => dot.is_reference_type(value),
        // TODO: shouldn't be in dot
        dot.members_of(thing)
      )
    ),
});

exports.obj_walk_dot_spec = {
  describe_node(id, value) {
    if (Array.isArray(value))
      return {
        shape: "Mrecord",
        tooltip: id,
        label: value.map((value, key) => [
          key,
          { key, value: is_primitive(value) ? value : "" },
        ]),
      };

    if (isPlainObject(value))
      return {
        ...(is_leaf_object(value)
          ? { style: "filled", color: "lightblue" }
          : {}),
        tooltip: id,
        shape: "Mrecord",
        label: Object.entries(value).map(([key, value]) => [
          key,
          { key, value: is_primitive(value) ? value : "" },
        ]),
      };

    if (value) return { label: JSON.stringify(value, null, 2) };
  },
  describe_edge([from, to, data]) {
    if (data != null)
      return {
        tailport: `${data}:c`,
        tailclip: false,
        dir: "both",
        arrowtail: "dot",
      };
  },
};
