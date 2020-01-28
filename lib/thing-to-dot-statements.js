const dot = require("@def.codes/graphviz-format");
const { traverse, from_facts } = require("@def.codes/graphs");
const { dot_notate, dot_notate_store } = require("./dot-notate");
const {
  make_object_graph_traversal_spec,
  object_graph_dot_notation_spec,
} = require("@def.codes/node-web-presentation");
const { dot_interpret_pipeline } = require("./dot-interpret-pipeline");
const ConstructDot = require("../queries/construct-dot");
const Construct = require("../queries/construct-copy");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");

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

const DEFAULT_PIPELINE = [
  [Construct.Copy, ConstructDot.Node],
  [ConstructDot.Edge],
  [ConstructDot.NodeLabel, ConstructDot.EdgeLabel],
];

const DEFAULT_SPEC = {
  copy: [Construct.Copy],
  node: [ConstructDot.Node],
  edge: [ConstructDot.Edge],
  node_label: [ConstructDot.NodeLabel],
  edge_label: [ConstructDot.EdgeLabel],
  annotate: [],
};

const store_via_dot_interpret = (source, extension) => {
  const spec = { ...DEFAULT_SPEC, ...extension };
  const pipeline = Object.values(spec);
  const result = dot_interpret_pipeline({ source, pipeline });
  return { dot_statements: result.output };
};

const triples_via_dot_interpret = (triples, extension) => {
  const source = new RDFTripleStore(triples);
  // TEMP: include source for compat with `dot_notate`
  return { source, ...store_via_dot_interpret(source, extension) };
};

module.exports = {
  triples_old: dot_notate,
  triples: triples_via_dot_interpret,
  store_old: dot_notate_store,
  store: store_via_dot_interpret,
  graph: graph_to_dot_statements,
  facts: facts_to_dot_statements,
  thing: thing_to_dot_statements,
  things: things_to_dot_statements,
};
