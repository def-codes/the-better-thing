const tx = require("@thi.ng/transducers");
const { DOT, TYPES } = require("@def.codes/graphviz-format");
const { sync_query } = require("@def.codes/rstream-query-rdf");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { dot_interpret_rdf_store } = require("./dot-interpret-rdf-store");
const { triples_to_dot_description } = require("./triples-to-dot-description");
const { bnodes_in, literals_in, terms_in } = require("./rdf-operations");

const { NODE, EDGE } = TYPES;
const { namedNode: n, blankNode: b, literal: l, variable: v } = factory;

const TYPE = n("rdf:type");

// HACK: see below
const TERM_TYPE = n("def:termType");
const BLANK_NODE = n("def:BlankNode");
const LITERAL = n("def:Literal");
const VARIABLE = n("def:Variable");

const find_all_dot_edges = store =>
  Array.from(
    sync_query(store, [[v("edge"), TYPE, n(EDGE)]]) || [],
    _ => _.edge
  );

// all this is a hack based on a defunct approach to dot mapping
function mark_bnodes(store, color) {
  store.into(
    tx.iterator(
      tx.comp(
        // HACK: We want special treatment for nodes that *represent* blank
        // nodes, not just *are* blank nodes in the Dot representation (which
        // uses blank nodes for edges, variables and literals).  This is an
        // ad-hoc alternative to information generally tying back Dot statements
        // to the things being represented.
        tx.filter(node => store.has([node, TERM_TYPE, BLANK_NODE])),
        tx.mapcat(bn => [
          [bn, n(`${DOT}shape`), l("square")],
          [bn, n(`${DOT}label`), l("")],
          [bn, n(`${DOT}width`), l(0.1)],
          ...(color
            ? [
                [bn, n(`${DOT}style`), l("filled")],
                [bn, n(`${DOT}color`), l(color)],
              ]
            : []),
        ])
      ),
      bnodes_in(store)
    )
  );
}

// which should have no shape.  re hack, see above.  note they are bnodes
function mark_literals(store) {
  store.into(
    tx.mapcat(
      t => [[t, n(`${DOT}shape`), l("none")]],
      tx.filter(node => store.has([node, TERM_TYPE, LITERAL]), bnodes_in(store))
    )
  );
}

// which should have a distinct shape.  re hack, see above.  note they are bnodes
// predicates could be variables, too, but I think shape is ignored on edge
function mark_variables(store) {
  store.into(
    tx.mapcat(
      t => [[t, n(`${DOT}shape`), l("diamond")]],
      tx.filter(node => store.has([node, TERM_TYPE, VARIABLE]), terms_in(store))
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
  mark_literals(dot_store);
  mark_variables(dot_store);
  mark_edges(dot_store, color ? { color, fontcolor: color } : {});
  return dot_store;
}

function dot_notate_store(store, color) {
  const dot_store = make_dot_store_from(store, color);
  const dot_statements = [...dot_interpret_rdf_store(dot_store)];
  return { source: store, dot_store, dot_statements };
}

function dot_notate(triples, color) {
  const store = new RDFTripleStore(triples);
  return dot_notate_store(store, color);
}

module.exports = { dot_notate, dot_notate_store };
