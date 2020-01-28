const show = require("./lib/thing-to-dot-statements");
const { q } = require("@def.codes/meld-core");
const { DOT } = require("@def.codes/graphviz-format");
const { factory } = require("@def.codes/rstream-query-rdf");
const { prefix_statement_keys, clusters_from } = require("./lib/clustering");
const { simple_bnode_mapping } = require("./lib/simple-bnode-mapping");
const { notate_mapping } = require("./lib/notate-mapping");
const TEST_CASES = require("./lib/example-graph-pairs");

const prep = (...cs) =>
  q(
    ...cs.map(_ =>
      _.replace(/dot:/g, DOT).replace(/(^|\s)a(\s|$)/g, "$1rdf:type$2")
    )
  );

const { namedNode: n, blankNode: b, literal: l, variable: v } = factory;

const color_edges = color => ({
  annotate: [
    {
      construct: prep(`?e dot:color "${color}"`),
      where: prep("?e a dot:Edge"),
    },
  ],
});

const main = test_cases => {
  const do_entail_case = entail_case => ({
    //         // [edge, n(`${DOT}style`), l(color === "red" ? "dashed" : "solid")],
    a: show.triples(entail_case.target, color_edges("blue")),
    b: show.triples(entail_case.source, color_edges("red")),
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
    const [case_name, entail_case] = Object.entries(test_cases)[number];
    const { a: A, b: B, clusters, merged } = case_statements(entail_case);
    const base_dot_statements = [merged, clusters][mode];
    const res = simple_bnode_mapping(A.source, B.source);
    const { output: mapping } = res;

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
  const statements = Object.keys(Object.keys(test_cases)).map(idx =>
    do_case(idx, 0)
  );

  return {
    dot_graph: {
      directed: true,
      attributes: { rankdir: "LR", concentrate: false, newrank: true },
      statements,
    },
  };
};

exports.display = main(TEST_CASES);
