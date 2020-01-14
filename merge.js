const { inspect } = require("util");
const tx = require("@thi.ng/transducers");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { merge_preprocess_source } = require("./lib/merge-graphs");
const cases = require("./lib/example-graph-pairs");
const { simple_entailment_mapping, is_blank_node } = require("./lib/graph-ops");
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

  //   2a: for each resulting subgraph, attempt node mapping into target
  const mappings_base = Array.from(bnode_islands, island => ({
    island,
    mapping: simple_entailment_mapping(a, new RDFTripleStore(island)),
  }));

  const mappings = mappings_base.map(item => {
    const get_more = ({ island, mapping }) => {
      if (mapping.size === 0) {
        //   2c: if no match, map new minted bnodes to existing ones
        console.log("no mappings for this island... need to mint", island);
        const map = new Map();
        const sub = term => {
          if (!is_blank_node(term)) return term;
          if (!map.has(term)) map.set(term, factory.blankNode());
          return map.get(term);
        };
        const minted = island.map(([s, p, o]) => [sub(s), p, sub(o)]);
        console.log(`minted`, minted);
        return { minted };
      }
      // 2b: if match, discard (asserting that substituted facts exist)
      const sub = term => mapping.get(term) || term;
      return {
        entailed: island.map(triple => {
          const subbed = triple.map(sub);
          return { triple, subbed, pass: a.has(subbed) };
        }),
      };
    };

    return { ...item, ...get_more(item) };
  });

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
  // 41
  Object.entries(cases).length - 1
];

const {
  triples_with_bnodes,
  bnode_components,
  bnode_islands,
  mappings,
} = do_merge(merge_case);

for (const { island, entailed } of mappings) {
  if (entailed) {
    const failed = entailed.filter(_ => !_.pass);
    if (failed.length) console.log(`ASSERTS FAILED:`, failed);
    else console.log(`All assertions passed!!!`);
  }
}

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
      // rankdir: "LR",
      // layout: "circo",
    },
    statements: dot_statements,
  },
};
