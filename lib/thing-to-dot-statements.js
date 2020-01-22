const dot = require("@def.codes/graphviz-format");
const { traverse, from_facts } = require("@def.codes/graphs");
const {
  make_object_graph_traversal_spec,
  object_graph_dot_notation_spec,
} = require("@def.codes/node-web-presentation");

const graph_to_dot_statements = graph => {
  const dot_statements = [
    ...dot.statements_from_graph(graph, object_graph_dot_notation_spec),
  ];
  return { dot_statements };
};

const facts_to_dot_statements = facts => {
  const graph = from_facts(facts);
  return { facts, graph, ...graph_to_dot_statements(graph) };
};

const things_to_dot_statements = things =>
  facts_to_dot_statements([
    ...traverse(things, make_object_graph_traversal_spec()),
  ]);

const thing_to_dot_statements = thing => things_to_dot_statements([thing]);

module.exports = {
  graph: graph_to_dot_statements,
  facts: facts_to_dot_statements,
  thing: thing_to_dot_statements,
  things: things_to_dot_statements,
};
