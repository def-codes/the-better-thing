const { Graph } = require("@def.codes/graphs");
const workflow = new Graph();
// workflow.add_node("input", "value");
// workflow.add_node("fn1", "function");
// workflow.add_node("fn2", "function");
// workflow.add_node("result1", "value");
workflow.add_edge("input", "fn1");
workflow.add_edge("fn1", "result1");
workflow.add_edge("result1", "fn2");

workflow.add_edge("value", "graph?");
workflow.add_edge("graph?", "graph", "yes");
workflow.add_edge("graph?", "traversal", "no");
workflow.add_edge("traversal", "graph", "graph\nreducer");
workflow.add_edge("graph", "dot", "graph-dot\nspec");
const workflow_spec = {
  describe_edge: ([, , label]) => label && { label },
  describe_node: (id, type) =>
    (/\?/.test(id) && { shape: "diamond" }) ||
    ((id.startsWith("fn") || type === "function") && { shape: "square" }),
};
module.exports = { workflow };
