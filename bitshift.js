const tx = require("@thi.ng/transducers");
const dot = require("@def.codes/graphviz-format");
const { traverse } = require("@def.codes/graphs");
const {
  make_object_graph_traversal_spec,
  object_graph_dot_notation_spec: ospec,
} = require("@def.codes/node-web-presentation");

const left_shift = (n, r) => n << r;
const int = s => parseInt(s, 10);
const bits = n =>
  n
    .toString(2)
    .split("")
    .map(int);

const obj = { name: "Alice", age: 598, adversary: { name: "Bob", age: 64 } };
const traversal = [...traverse([obj], make_object_graph_traversal_spec())];
const statements = [...dot.statements_from_traversal(traversal, ospec)];

exports.display = {
  dot_graph: {
    directed: true,
    // attributes: { splines: false },
    statements: [
      ...statements,
      ...tx.iterator(
        tx.comp(
          tx.map(({ type, id, attributes }) => {
            // EXTREMELY hacky way to get numbers and where they're notated
            const r =
              type === "node" &&
              attributes &&
              attributes.shape === "record" &&
              // it's already been converted to a string
              [...tx.flatten(attributes.label)].find(
                x => x && (typeof x.value === "number" || int(x.value) > 0)
              );
            if (r) return { target: id, port: r.key, value: int(r.value) };
          }),
          tx.keep(),
          tx.map(x => {
            const id = `base2_of_${x.target}:${x.port}`;
            const id2 = `shifted_base2_of_${x.target}:${x.port}`;
            const offset = 8;
            const bits1 = bits(x.value);
            const shifted = left_shift(x.value, offset);
            const bits2 = bits(shifted);
            const vector = ns => ({
              type: "node",
              attributes: {
                shape: "record",
                label: ns.map((value, index, a) => ({
                  value,
                  key: a.length - index - 1,
                })),
                height: -1,
              },
            });

            return [
              ...bits1.map((n, index, a) => ({
                type: "edge",
                from: { id, port: a.length - index - 1, compass: "c" },
                to: {
                  id: id2,
                  port: a.length - index - 1 + offset,
                  compass: "c",
                },
                attributes: { color: "gray", tailclip: false },
              })),
              { ...vector(bits1), id },
              {
                type: "edge",
                from: { id: x.target, port: x.port },
                to: id,
                attributes: { label: "base 2" },
              },
              { ...vector(bits2), id: id2 },
              {
                type: "edge",
                from: id,
                to: id2,
                attributes: {
                  label: `<< ${offset}`,
                  color: "transparent",
                  constraint: false,
                },
              },
            ];
          }),
          tx.flatten()
        ),
        statements
      ),
    ],
  },
};
