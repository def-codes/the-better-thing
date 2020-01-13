const { inspect } = require("util");
const tx = require("@thi.ng/transducers");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { merge_preprocess_source } = require("./lib/merge-graphs");
const cases = require("./lib/simple-merge-cases");
const { simple_entailment_mapping } = require("./lib/graph-ops");
const { dot_notate } = require("./lib/dot-notate");
const { clusters_from } = require("./lib/clustering");
const { color_connected_components } = require("./lib/color-connected");
const { notate_mapping } = require("./lib/notate-mapping");

const { blankNode: b } = factory;

// merge the triples from graph b into graph a using simple entailment
const merge_graphs_simple = (a, b) => {
  // part 1: analyze incoming graph
  const part1 = merge_preprocess_source(b);
  const { triples_with_bnodes, bnode_components, bnode_islands } = part1;

  // part 2: determine existing entailment
  const mappings = bnode_islands.map(island =>
    simple_entailment_mapping(a, new RDFTripleStore(island))
  );

  console.log(`mappings`, mappings);

  //   2a: for each resulting subgraph, attempt node mapping into target
  //   2b: if match, discard (asserting that substituted facts exist)
  //   2c: if no match, map new minted bnodes to existing ones

  // part 3: perform merge
  //   3a: (to view incoming) remove facts already in target
  //   3b: insert resulting facts into target

  return { ...part1, mappings };
};

function do_merge({ source, target, merged }) {
  const source_store = new RDFTripleStore(source);
  const target_store = new RDFTripleStore(target);
  return merge_graphs_simple(target_store, source_store);
}

const [case_name, merge_case] = Object.entries(cases)[
  6
  // Object.entries(cases).length - 25
];

const {
  triples_with_bnodes,
  bnode_components,
  bnode_islands,
  mappings,
} = do_merge(merge_case);

const island_having = node => bnode_components.findIndex(set => set.has(node));

const bnodes_store = new RDFTripleStore(triples_with_bnodes);
const components = dot_notate(triples_with_bnodes, "gray");
const color_notes = [...color_connected_components(bnode_components)];

const target = dot_notate(merge_case.target, "blue").dot_statements;
// console.log(`bnode_components`, inspect(bnode_components, { depth: 5 }));

const dot_statements = clusters_from({
  components: components.dot_statements,
  bnode_components: [...color_notes, ...components.dot_statements],
  bnode_islands: [
    ...target,
    ...tx.flatten(
      mappings.map(m => [
        ...notate_mapping(
          new Map(
            Array.from(m, ([k, v]) => [
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
          dot_notate(trips).dot_statements,
        ])
      ),
      "bnode_islands"
    ),
  ],
  source: dot_notate(merge_case.source, "red").dot_statements,
  // target,
  // merged: dot_notate(merge_case.merged, "purple").dot_statements,
}).map(_ => ({ ..._, attributes: { label: _.id.slice("cluster ".length) } }));

exports.display = {
  // thing: entail_case,
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
