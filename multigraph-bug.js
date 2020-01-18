// see work notes.
// the graph is missing an edge, because Graph is not a multigraph
const show = require("./lib/thing-to-dot-statements");

const A = { foo: "bar" };
const B = { baz: "bat" };

const foo = show.thing([A, B, A]);
console.log(`foo`, require("util").inspect(foo, { depth: 4 }));

exports.display = {
  // thing: { first: A, second: B, third: A },
  // thing: [A, B, A],
  dot_statements: foo.dot_statements,
};
