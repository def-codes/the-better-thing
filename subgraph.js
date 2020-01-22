// subgraph views
const { from_facts, SubgraphView } = require("@def.codes/graphs");
const show = require("./lib/thing-to-dot-statements");
const { clusters_from } = require("./lib/clustering");

const FACTS = [
  { subject: "a", value: "a" },
  { subject: "p", value: "P" },
  { subject: "q", value: "q" },
  { subject: "z", value: "Z" },
  { subject: "a", object: "p", data: "ap" },
  { subject: "a", object: "q", data: "aq" },
  { subject: "p", object: "z", data: "pz" },
  { subject: "q", object: "z", data: "qz" },
];

const TEST_CASES = [
  {
    name: "NoFilter",
    facts: FACTS,
  },
  {
    name: "AllIsTrue",
    facts: FACTS,
    node_predicate: () => true,
    edge_predicate: () => true,
  },
  {
    name: "NoLowercaseNodes",
    facts: FACTS,
    node_predicate: node => node === node.toUpperCase(),
  },
  {
    name: "FilterEdgeByNodeIds",
    facts: [
      { subject: "Alice", value: "Alice" },
      { subject: "Bob", value: "Bob" },
      { subject: "Carol", value: "Carol" },
      { subject: "Alice", object: "Carol", data: "loves" },
      { subject: "Bob", object: "Alice", data: "loves" },
      { subject: "Carol", object: "Bob", data: "loves" },
    ],
    edge_predicate: (_, from, to) =>
      !(
        (from === "Bob" && to === "Carol") ||
        (from === "Carol" && to === "Bob")
      ),
  },
];

function do_test_case({ name, facts, node_predicate, edge_predicate }) {
  const graph = from_facts(facts);
  const subgraph = new SubgraphView(graph, { node_predicate, edge_predicate });
  return { graph, subgraph };
}

const test_case_number = 3;
const test_case = TEST_CASES[test_case_number];
const { graph, subgraph } = do_test_case(test_case);

const graph_statements = show.graph(graph).dot_statements;
const subgraph_statements = show.graph(subgraph).dot_statements;

const dot_statements = clusters_from({
  graph: graph_statements,
  subgraph: subgraph_statements,
  merged: [
    ...graph_statements.filter(
      x =>
        !subgraph_statements.find(
          ({ type, id, from, to }) =>
            (x.type === "node" && type === "node" && x.id === id) ||
            (x.type === "edge" &&
              type === "edge" &&
              x.from === from &&
              x.to === to)
        )
    ),
    ...subgraph_statements.map(({ attributes, ...rest }) => {
      return {
        ...rest,
        attributes: { ...(attributes || {}), penwidth: 5, color: "#00009977" },
      };
    }),
  ],
}).map(_ => ({ ..._, attributes: { label: _.id.slice("cluster ".length) } }));

exports.display = {
  dot_graph: {
    directed: true,
    statements: dot_statements,
  },
};
