// subgraph views
const { from_facts, SubgraphView } = require("@def.codes/graphs");

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

exports.display = { graph: subgraph };
