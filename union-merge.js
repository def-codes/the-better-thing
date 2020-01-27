const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const tx = require("@thi.ng/transducers");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { union_rdf_stores, merge_rdf_stores } = require("./lib/rdf-union-merge");
const simple = require("./graphs/simple");

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
  const { output: union_same } = union_rdf_stores(a_store, b_store_same);
  const { output: union_diff } = union_rdf_stores(a_store, b_store_diff);
  const { output: merge_same } = merge_rdf_stores(a_store, b_store_same);
  const { output: merge_diff } = merge_rdf_stores(a_store, b_store_diff);

  const dot_statements = clusters_from({
    a: Object.assign(show.store(a_store), { attributes: { style: "filled" } }),
    b: show.store(b_store_same),
    "union shared": Object.assign(show.store(union_same), {
      attributes: { style: "filled" },
    }),
    "union ": show.store(union_diff),
    "merge shared": Object.assign(show.store(merge_same), {
      attributes: { style: "filled" },
    }),
    merge: show.store(merge_diff),
    // intermediate: show.thing(intermediate),
  });

  return {
    dot_graph: {
      directed: true,
      attributes: { label: `${a_label} ∪ ${b_label}`, labelloc: "t" },
      statements: dot_statements,
    },
  };
};

// exports.display = main(TEST_CASES[0]);
const items = Object.entries(simple);
exports.display = main(items[8], items[8]);
