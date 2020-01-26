// const { inspect } = require("util");
// const tx = require("@thi.ng/transducers");
const show = require("./lib/thing-to-dot-statements");
const { equiv } = require("@thi.ng/equiv");
const { DOT } = require("@def.codes/graphviz-format");
const { factory } = require("@def.codes/rstream-query-rdf");
const { prefix_statement_keys, clusters_from } = require("./lib/clustering");
const entail_cases = require("./lib/example-graph-pairs");
const { simple_bnode_mapping } = require("./lib/simple-bnode-mapping");
const { notate_mapping } = require("./lib/notate-mapping");

const { namedNode: n, blankNode: b, literal: l, variable: v } = factory;

/* other sources
function get_source_triples() {
  const { some_object_graph } = require("./lib/test-object-graph");
  const { some_ast } = require("./lib/some-ast");
  const { evaluate_cases } = require("./lib/evaluate-cases");
  const {
    simple_records,
    symmetric_property_with_bnodes,
  } = require("./lib/rdf-js-examples");
}
*/

const do_entail_case = entail_case => ({
  //         // [edge, n(`${DOT}style`), l(color === "red" ? "dashed" : "solid")],
  a: show.triples(entail_case.target, "blue"),
  b: show.triples(entail_case.source, "red"),
});

function case_statements(entail_case) {
  const { a, b } = do_entail_case(entail_case);

  const merged = [...a.dot_statements, ...b.dot_statements];
  // const side_by_side_statements = [
  //   ...prefix_statement_keys("a")(dot_statements_1),
  //   ...prefix_statement_keys("b")(dot_statements_2),
  // ];
  return {
    a,
    b,
    merged,
    clusters: clusters_from({ a: a.dot_statements, b: b.dot_statements }),
  };
}

// this no longer really plays well with clusters mode
function do_case(number = 0, mode = 0) {
  const [case_name, entail_case] = Object.entries(entail_cases)[number];
  const { a: A, b: B, clusters, merged } = case_statements(entail_case);
  const base_dot_statements = [merged, clusters][mode];
  const mapping = simple_bnode_mapping(A.source, B.source);

  return {
    type: "subgraph",
    id: `cluster case ${number}`,
    attributes: { label: case_name },
    statements: prefix_statement_keys(`c${number} `)([
      ...base_dot_statements,
      ...notate_mapping(mapping),
    ]),
  };
}

// case_number = Object.keys(entail_cases).length - 1;
const dot_statements = Object.keys(Object.keys(entail_cases)).map(idx =>
  do_case(idx, 0)
);

exports.display = {
  // dot_statements,
  dot_graph: {
    directed: true,
    node_attributes: {
      // shape: "circle",
    },
    edge_attributes: {
      // minlen: 50,
    },
    attributes: {
      rankdir: "LR",
      // layout: "fdp",
      concentrate: false,
      newrank: true,
      // splines: false,
    },
    statements: dot_statements,
  },
};
