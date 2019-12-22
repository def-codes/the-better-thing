const hex = n => n.toString(16).padStart(0, "0");
const byte = r => Math.floor(r * 255);

exports.things = [
  {
    comment: "when you need any color (in rgb)",
    value: () => ({ r: random, g: random, b: random }),
  },
  {
    comment: "when you need any color (in hsl)",
    value: () => ({ h: random, s: random, l: random }),
  },
  {
    comment: "convert rgb to css-compatible color string",
    input_constraints: "type is rgb color",
    output_constraints: "type is css-compatible color string",
    relationship_constraints: "output represents the same color as input",
    value: ({ r, g, b }) => `rgb$(${byte(r)},${byte(g)},${byte(b)})`,
  },
  {
    comment: "convert hsl to rgb",
    input_constraints: "type is hsl color",
    output_constraints: "type is rgb color",
    relationship_constraints: "output represents the same color as input",
    value: hsl => ({}), // ?
  },
  {
    comment: "convert rgb to hsl",
    input_constraints: "type is rgb color",
    output_constraints: "type is hsl color",
    relationship_constraints: "output represents the same color as input",
    value: rgb => ({}), // ?
  },
  {
    comment: "convert rgb color to hex",
    input_constraints: "type is rgb",
    output_constraints: "type is hex color",
    value: ({ r, g, b }) => `#${hex(r)}${hex(g)}${hex(b)}`,
  },
  {
    comment: "when you need any number bigger than x",
    constraints: [
      { subject: "?result", predicate: "greaterThan", object: "?x" },
    ],
    value: x => x + Math.random(),
  },
  {
    comment: "when you need any number smaller than y",
    constraints: [{ subject: "?result", predicate: "lessThan", object: "?y" }],
    value: y => y - Math.random(),
  },
  {
    comment: "when you need any number between x and y",
    constraints: [
      { subject: "?result", predicate: "greaterThan", object: "?x" },
      { subject: "?result", predicate: "lessThan", object: "?y" },
    ],
    value: (x, y) => x + (y - x) * Math.random(),
  },
  {
    comment: "when you need a number and it doesn't matter what",
    value: Math.random,
  },
];
