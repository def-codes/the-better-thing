import { serialize_dot } from "./serialize";
const test = {
  test: serialize_dot({
    type: "graph",
    directed: true,
    statements: [
      {
        type: "node",
        id: "duty",
        attributes: {
          shape: "Mrecord",
          label: "{ p | q }",
        },
      },
      {
        type: "node",
        id: "simple",
        attributes: {
          label: "simple string",
        },
      },
      {
        type: "node",
        id: "record1",
        attributes: {
          shape: "Mrecord",
          label: ["Mrecord", "one"],
        },
      },
      {
        type: "node",
        id: "record2",
        attributes: {
          shape: "Mrecord",
          label: ["Mrecord", ["with", "nested", "values"]],
        },
      },
      {
        type: "node",
        id: "record3",
        attributes: {
          shape: "Mrecord",
          label: [{ key: "abc", value: "1 keyed field" }],
        },
      },
      {
        type: "edge",
        from: { id: "record3", port: "abc" },
        to: "record2",
      },
      {
        type: "node",
        id: "record4",
        attributes: {
          shape: "Mrecord",
          label: [
            1,
            3,
            4,
            [
              "trail",
              "mix",
              [
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                Array.from([1, 2, 3, 4, 5, 6, 7], (x, i) => ({
                  key: "abcdeffghijk".charAt(i),
                  value: `#${x}`,
                })),
              ],
            ],
            "error",
          ],
        },
      },
      {
        type: "edge",
        from: { id: "record4", port: "b" },
        to: { id: "record4", port: "c" },
      },
      {
        type: "node",
        id: "record5",
        attributes: {
          shape: "Mrecord",
          label: [
            "npr",
            { key: "abc", value: "bomb" },
            { key: "cbs", value: "plop" },
            { key: "nbc", value: "fizz" },
          ],
        },
      },
      {
        type: "edge",
        from: "record1",
        to: { id: "record5", port: "cbs" },
      },
      {
        type: "edge",
        from: "record1",
        to: { id: "record5", port: "nbc" },
      },
      {
        type: "edge",
        from: "record1",
        to: { id: "record5", port: "abc" },
      },
      {
        type: "edge",
        from: "record2",
        to: { id: "record5", port: "npr" },
      },
      {
        type: "node",
        id: "record6",
        attributes: {
          shape: "Mrecord",
          label: [
            { key: "aok", value: "jet" },
            { key: "bones", value: "mcoy" },
          ],
        },
      },
    ],
  }),
  nested_record: `digraph {
a [shape="record" label="a | <g> b  | { P | Q | Z | { {{x}} | y | z } }"]
}`,
};
