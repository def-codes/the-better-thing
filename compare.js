const { inspect } = require("util");
const tx = require("@thi.ng/transducers");
const show = require("./lib/thing-to-dot-statements");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const cases = require("./lib/example-graph-pairs");
const { compare_graphs_simple } = require("./lib/compare-graphs");
const { clusters_from } = require("./lib/clustering");
const { color_connected_components } = require("./lib/color-connected");
const { notate_mapping } = require("./lib/notate-mapping");

const { blankNode: b } = factory;

const do_compare_case = ({ source, target }) => {
  const source_store = new RDFTripleStore(source);
  const target_store = new RDFTripleStore(target);
  const res = compare_graphs_simple(target_store, source_store);
  return { ...res, source_store, target_store };
};

const [case_name, compare_case] = Object.entries(cases)[41];
// Object.entries(cases).length - 4

const result = do_compare_case(compare_case);
const {
  store,
  components: bnode_components,
  islands: bnode_islands,
  mappings,
  incoming,
  source_store,
  target_store,
} = result;

// console.log(`incoming`, incoming);

for (const { entailed } of mappings) {
  if (entailed) {
    const failed = entailed.filter(_ => !target_store.has(_.mapped));
    if (failed.length)
      console.log(`ASSERTS FAILED:`, inspect(failed, { depth: 5 }));
    else console.log(`All assertions passed!!!`);
  }
}

const island_having = node => bnode_components.findIndex(set => set.has(node));

const components = show.store(store, "gray");

const color_notes = [...color_connected_components(bnode_components)];

const target = show.triples(compare_case.target, "blue").dot_statements;
// console.log(`bnode_components`, inspect(bnode_components, { depth: 5 }));

const bnode_colored = [...components.dot_statements, ...color_notes];

const dot_statements = clusters_from({
  components: components.dot_statements,
  color_notes: show.thing(color_notes).dot_statements,
  bnode_colored,
  bnode_islands: [
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
    ...clusters_from(
      Object.fromEntries(
        Object.entries(bnode_islands).map(([key, trips]) => [
          key,
          show.triples(trips).dot_statements,
        ])
      ),
      "bnode_islands"
    ),
  ],
  source: show.triples(compare_case.source, "red").dot_statements,
  incoming: show.triples(incoming, "green").dot_statements,
  result: show.triples([...compare_case.target, ...incoming], "darkgreen")
    .dot_statements,
  // target,
  // merged: show.triples(compare_case.merged, "purple").dot_statements,
});

exports.display = {
  dot_graph: {
    directed: true,
    attributes: {
      label: case_name,
      // splines: false,
      rankdir: "LR",
      // layout: "circo",
    },
    statements: dot_statements,
  },
};
