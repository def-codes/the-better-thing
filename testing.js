const { display } = require("@def.codes/node-web-presentation");
const dot = require("@def.codes/graphviz-format");

const names = "john paul george rich".split(" ");

const graph = dot.graph({
  statements: [
    { type: "node", id: "foo" },
    ...names.map(id => ({
      type: "node",
      id,
      attributes: { style: "filled", color: "red", fontcolor: "white" },
    })),
  ],
});
console.log(`graph`, graph);

display(graph);
