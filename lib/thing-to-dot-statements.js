const dot = require("@def.codes/graphviz-format");
const { traverse, from_facts } = require("@def.codes/graphs");
const {
  make_object_graph_traversal_spec,
  object_graph_dot_notation_spec,
} = require("@def.codes/node-web-presentation");

const things_to_dot_statements = things => {
  const facts = [...traverse(things, make_object_graph_traversal_spec())];
  const graph = from_facts(facts);
  const dot_statements = [
    ...dot.statements_from_graph(graph, object_graph_dot_notation_spec),
  ];
  return { facts, graph, dot_statements };
};

const thing_to_dot_statements = thing => things_to_dot_statements([thing]);

module.exports = {
  thing: thing_to_dot_statements,
  things: things_to_dot_statements,
};
