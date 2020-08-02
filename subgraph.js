// subgraph views
const tx = require("@thi.ng/transducers");
const { q } = require("@def.codes/meld-core");
const {
  from_facts,
  subgraph_view,
  triple_store_graph,
  rdf_triple_store_graph,
} = require("@def.codes/graphs");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const show = require("./lib/show");
const { generate_triples } = require("./lib/random-triples");
const { clusters_from } = require("./lib/clustering");
const { triples_to_facts } = require("./lib/triples-to-facts");
const pairs = require("./lib/example-graph-pairs");

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
    name: "BlankNodes",
    triples: q("_:A b C", "_:D e _:F", "_:G h I", "C z _:D", "_:G z C"),
    node_predicate: _ => _.termType === "BlankNode",
  },
  {
    name: "RandomGraphViaTriplesToFacts",
    facts: triples_to_facts(tx.take(14, generate_triples())),
    node_predicate: (_, s) => /[abcdefg]/.test(s.value),
    edge_predicate: (p, s, o) => !/[abcdefghi]/.test(p.value),
  },
  {
    name: "RandomGraphViaAdapter",
    triples: [...tx.take(14, generate_triples())],
    node_predicate: (_, s) => /[abcdefg]/.test(s.value),
    edge_predicate: (p, s, o) => !/[abcdefghi]/.test(p.value),
  },
  {
    name: "RDFTypeViaTriplesToFacts",
    comment: "Select only the (pseudo) “type” relationships",
    facts: triples_to_facts(
      pairs[
        "bnodes with disconnected components"
        //"with multiple grounded triples to merge"
      ].target
    ),
    edge_predicate: p => p.termType === "NamedNode" && p.value === "a",
  },
  {
    name: "RDFTypeViaAdapter",
    comment: "Select only the (pseudo) “type” relationships",
    triples:
      pairs[
        "bnodes with disconnected components"
        //"with multiple grounded triples to merge"
      ].target,
    edge_predicate: p => p.termType === "NamedNode" && p.value === "a",
  },
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

function do_test_case({ name, facts, triples, ...predicates }) {
  let store, graph;
  if (facts) graph = from_facts(facts);
  else if (triples) {
    store = new RDFTripleStore(triples);
    graph = rdf_triple_store_graph({ store });
  } else throw `No input for ${name}`;
  const subgraph = subgraph_view(graph, { ...predicates });
  return { store, graph, subgraph };
}

const test_case_number = 0;
const test_case = TEST_CASES[test_case_number];
const { store, graph, subgraph } = do_test_case(test_case);

const graph_statements = show.graph(graph);
const subgraph_statements = show.graph(subgraph);

const dot_statements = clusters_from({
  ...(store ? { rdf: show.store(store) } : {}),
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
        attributes: {
          ...(attributes || {}),
          penwidth: 5,
          fontcolor: "#00009977",
          color: "#00009977",
        },
      };
    }),
  ],
});

exports.display = {
  dot_graph: {
    directed: true,
    attributes: { label: test_case.name, rankdir: "LR" },
    statements: dot_statements,
  },
};
