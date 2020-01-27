const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const tx = require("@thi.ng/transducers");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const TEST_CASES = require("./lib/example-graph-pairs");
const { compare_graphs_simple } = require("./lib/compare-graphs");
const { color_connected_components } = require("./lib/color-connected");
const { notate_mapping } = require("./lib/notate-mapping");

const { blankNode: b } = factory;

const main = (label, test_case) => {
  const { source: source_triples, target: target_triples } = test_case;

  const source_store = new RDFTripleStore(source_triples);
  const target_store = new RDFTripleStore(target_triples);
  const comparison = compare_graphs_simple(target_store, source_store);
  const { output: mappings } = comparison;
  const { atomized, bnode_subgraphs } = comparison.intermediate;
  const { islands } = atomized.intermediate;

  const { store, components: bnode_components } = islands.intermediate;
  const bnode_islands = islands.output;

  const island_having = node =>
    bnode_components.findIndex(set => set.has(node));

  const components = show.store(store);
  const color_notes = [...color_connected_components(bnode_components)];
  const target = show.triples(test_case.target);
  const bnode_colored = [...components, ...color_notes];

  const statements = clusters_from({
    // components,
    // color_notes: show.thing(color_notes),
    bnode_colored,
    bnode_islands: {
      _: [
        ...target,
        ...tx.flatten(
          mappings.map(m => [
            ...notate_mapping(
              new Map(
                Array.from(m.mapping, ([k, v]) => [
                  b(`${island_having(b(k.value))}/${k.value}`),
                  v,
                ])
              )
            ),
          ])
        ),
      ],
      ...Object.fromEntries(
        Object.entries(bnode_islands).map(([key, trips]) => [
          key,
          show.triples(trips),
        ])
      ),
    },
    source: show.triples(source_triples),
    // target,
  });

  return {
    dot_graph: {
      directed: true,
      attributes: { label, labelloc: "t", rankdir: "LR" },
      statements,
    },
  };
};

exports.display = main(...Object.entries(TEST_CASES)[41]);
