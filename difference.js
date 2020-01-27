const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const tx = require("@thi.ng/transducers");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
// const { union_rdf_stores, merge_rdf_stores } = require("./lib/rdf-union-merge");
const simple = require("./graphs/simple");

/////////////////////////////////////////////////////////////////////////////////////////////////
// const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { compare_graphs_simple } = require("./lib/compare-graphs");
// everything that's in a that isn't in b
// TODO: what about bnode spaces
// TODO: what about entailment
const subtract_rdf_stores = (a, b) => {
  const store = new RDFTripleStore();
  for (const triple of a.triples) if (!b.has(triple)) store.add(triple);
  const comparison = compare_graphs_simple(a, b);
  return { intermediate: { comparison }, output: store };
};
///////////////////////////////////////////////////////////////////////////////////////////////////

// const TEST_CASES = [];
// for (const a of Object.keys(simple))
//   for (const b of Object.keys(simple))
//     if (a !== b)
//       TEST_CASES.push({ label: `${a} ∪ ${b}`, a: simple[a], b: simple[b] });

// const main = ({ label, a, b }) => {
const main = ([a_label, a], [b_label, b]) => {
  const a_store = new RDFTripleStore(a);
  const b_store_same = new RDFTripleStore(b, a.blank_node_space_id);
  const b_store_diff = new RDFTripleStore(b);
  const result_same = subtract_rdf_stores(a_store, b_store_same);
  const result_diff = subtract_rdf_stores(a_store, b_store_diff);
  const { output: subtract_same } = result_same;
  const { output: subtract_diff } = result_diff;

  const dot_statements = clusters_from({
    a: Object.assign(show.store(a_store), { attributes: { style: "filled" } }),
    b: show.store(b_store_same),
    "difference shared": Object.assign(show.store(subtract_same), {
      attributes: { style: "filled" },
    }),
    subtract: show.store(subtract_diff),
    comparison: show.thing(result_same.intermediate.comparison.output),
  });

  return {
    dot_graph: {
      directed: true,
      attributes: {
        label: `${a_label} − ${b_label}`,
        labelloc: "t",
        rankdir: "LR",
      },
      statements: dot_statements,
    },
  };
};

// exports.display = main(TEST_CASES[0]);
const items = Object.entries(simple);
exports.display = main(items[8], items[9]);
