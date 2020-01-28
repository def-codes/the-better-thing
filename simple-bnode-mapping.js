const show = require("./lib/show");
const { q } = require("@def.codes/meld-core");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { DOT } = require("@def.codes/graphviz-format");
const { clusters_from } = require("./lib/clustering");
const { simple_bnode_mapping } = require("./lib/simple-bnode-mapping");
const TEST_CASES = require("./lib/example-graph-pairs");

const { namedNode: n, blankNode: b } = factory;

const prep = (...cs) =>
  q(
    ...cs.map(_ =>
      _.replace(/dot:/g, DOT).replace(/(^|\s)a(\s|$)/g, "$1rdf:type$2")
    )
  );

const color_edges = color => ({
  annotate: [
    {
      construct: prep(`?e dot:color "${color}"`),
      where: prep("?e a dot:Edge"),
    },
  ],
});

const main = test_cases => {
  // Create a merged view.
  // Originally supported a separate cluster view with mapping across
  function do_case(case_name, entail_case, number) {
    const a_store = new RDFTripleStore(entail_case.target);
    const b_store = new RDFTripleStore(entail_case.source);

    const { output: mapping } = simple_bnode_mapping(a_store, b_store);

    const mapping_store = new RDFTripleStore(
      Array.from(mapping, ([bnode, term]) => [bnode, n("def:mapsTo"), term])
    );

    // HACK: Put everything into one store.  This only works because the test
    // data takes pains to avoid overlap of bnode labels between the two graphs.
    // But they are supposed to be separate spaces (is the whole point).

    const store = new RDFTripleStore();
    store.into(entail_case.target);
    store.into(entail_case.source);
    store.into(mapping_store);

    return show.store(store, {
      annotate: [
        {
          construct: prep(
            `?e dot:color "#FF00FF88"`,
            "?e dot:constraint false",
            "?e dot:penwidth 5",
            `?e dot:label ""`
          ),
          where: prep(`?e def:represents ?t`, "?t rdf:predicate def:mapsTo"),
        },
      ],
    });
  }

  const statements = clusters_from(
    Object.fromEntries(
      Object.entries(test_cases)
        .slice(0, 10)
        .map(([k, v], index) => [k, do_case(k, v, index)])
    )
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
