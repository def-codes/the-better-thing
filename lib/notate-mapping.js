const tx = require("@thi.ng/transducers");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { dot_interpret_rdf_store } = require("./dot-interpret-rdf-store");

const { DOT, TYPES } = require("@def.codes/graphviz-format");
const { EDGE } = TYPES;

const { namedNode: n, blankNode: b, literal: l, variable: v } = factory;

const TYPE = n("rdf:type");

const make_dot_edge = (from, to, attrs = {}) => {
  const edge = b();
  return [
    [edge, TYPE, n(EDGE)],
    [edge, n(`${DOT}from`), from],
    [edge, n(`${DOT}to`), to],
    ...Object.entries(attrs).map(([k, v]) => [edge, n(`${DOT}${k}`), l(v)]),
  ];
};

// arrows between mapped nodes (as Dot RDF terms)
const notate_mapping_rdf = (mapping, color = "#FF00FF88") =>
  tx.mapcat(
    ([from, target]) => [
      // what we really mean is the node representing Socrates
      // ...make_dot_edge(n("Socrates"), n("Greek"), {
      ...make_dot_edge(from, target, {
        constraint: false,
        color,
        penwidth: 5,
      }),
    ],
    mapping
  );

// arrows between mapped nodes (as structured Dot statements)
const notate_mapping = mapping => {
  const facts = notate_mapping_rdf(mapping);
  const store = new RDFTripleStore(facts);
  return dot_interpret_rdf_store(store);
};

module.exports = { notate_mapping };
