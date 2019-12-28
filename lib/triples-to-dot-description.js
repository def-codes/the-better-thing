const { DOT, TYPES } = require("@def.codes/graphviz-format");
const { NODE, EDGE } = TYPES;
const { make_identity_factory } = require("@def.codes/rdf-data-model");
const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l, normalize } = factory;

const RDF_TYPE = n("rdf:type"); // faux CURIE
const NODE_TYPE = n(NODE);
const EDGE_TYPE = n(EDGE);
const FROM = n(`${DOT}from`);
const TO = n(`${DOT}to`);
const LABEL = n(`${DOT}label`);

// this isn't done anywhere else, right?
// should be rule based
// the rule would be like
// ?s ?p ?o =>
//   ?s a dot:Node
//   ?n ...?
// how to represent the edge?
exports.triples_to_dot_description = function*(store) {
  const visited = new Set();
  // turn everything into a dot fact
  for (const [s, p, o] of store) {
    // yield a DOT node for this subject (once)
    if (!visited.has(s)) {
      yield [s, RDF_TYPE, NODE_TYPE];
      visited.add(s);
    }

    // yield a DOT edge for this triple
    // regarding literals, see not to lib/rdf-js-to-dot.js
    let target = o;
    if (!(o.termType === "NamedNode" || o.termType === "BlankNode")) {
      target = b();
      yield [target, RDF_TYPE, NODE_TYPE];
      yield [target, LABEL, l(o.value)];
    }
    const edge = b();
    yield [edge, RDF_TYPE, EDGE_TYPE];
    yield [edge, FROM, s];
    yield [edge, TO, target];
    yield [edge, LABEL, l(p.value)];
  }
};
