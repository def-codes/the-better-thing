const tx = require("@thi.ng/transducers");
const { DOT, TYPES } = require("@def.codes/graphviz-format");
const { sync_query } = require("@def.codes/rstream-query-rdf");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { dot_interpret_rdf_store } = require("./dot-interpret-rdf-store");
const { triples_to_dot_description } = require("./triples-to-dot-description");
const { bnodes_in } = require("./graph-ops");

const { NODE, EDGE } = TYPES;
const { namedNode: n, blankNode: b, literal: l, variable: v } = factory;

const TYPE = n("rdf:type");

/* currently unused
function mark_node(store, node) {
  store.into([
    [node, n(`${DOT}style`), l("filled")],
    [node, n(`${DOT}color`), l("red")],
    [node, n(`${DOT}shape`), l("circle")],
  ]);
}

function mark_edge(store, from, to) {
  const dot_edges = find_dot_edges(store, from, to);
  if (dot_edges) {
    const [dot_edge] = dot_edges;
    console.log(`dot_edge`, dot_edge);
    if (dot_edge) store.into([[dot_edge, n(`${DOT}color`), l("green")]]);
  }
}

const find_dot_edges = (store, from, to) =>
  Array.from(
    sync_query(store, [
      [v("edge"), TYPE, n(EDGE)],
      [v("edge"), n(`${DOT}from`), from],
      [v("edge"), n(`${DOT}to`), to],
    ]) || [],
    _ => _.edge
  );

*/

const find_all_dot_edges = store =>
  Array.from(
    sync_query(store, [[v("edge"), TYPE, n(EDGE)]]) || [],
    _ => _.edge
  );

// all this is a hack based on a defunct approach to dot mapping
function mark_bnodes(store, color = "red") {
  store.into(
    tx.iterator(
      tx.comp(
        // edges are blank nodes
        tx.filter(node => !store.has([node, TYPE, n(EDGE)])),
        tx.mapcat(bn => [
          [bn, n(`${DOT}shape`), l("square")],
          [bn, n(`${DOT}label`), l("")],
          [bn, n(`${DOT}width`), l(0.1)],
          [bn, n(`${DOT}style`), l("filled")],
          [bn, n(`${DOT}color`), l(color)],
        ])
      ),
      bnodes_in(store)
    )
  );
}

function mark_edges(store, attrs) {
  store.into(
    tx.mapcat(
      edge =>
        Object.entries(attrs).map(([k, v]) => [edge, n(`${DOT}${k}`), l(v)]),
      find_all_dot_edges(store)
    )
  );
}

function make_dot_store_from(store, color) {
  const dot_store = new RDFTripleStore(triples_to_dot_description(store));
  mark_bnodes(dot_store, color);
  mark_edges(dot_store, color ? { color, fontcolor: color } : {});
  return dot_store;
}

function dot_notate(triples, color) {
  const source = new RDFTripleStore(triples);
  const dot_store = make_dot_store_from(source, color);
  const dot_statements = [...dot_interpret_rdf_store(dot_store)];
  return { source, dot_store, dot_statements };
}

module.exports = { dot_notate };
