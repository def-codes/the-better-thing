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
// HACK: see below
const TERM_TYPE = n("def:termType");

// THIS is also in meld-core/system
const is_node = term =>
  term.termType === "NamedNode" || term.termType === "BlankNode";

// Allow distinguishing variables & named nodes
const term_label = term =>
  term.termType === "NamedNode" ? term.value : term.toString();

function* basic_node_facts(node, represents = node) {
  yield [node, RDF_TYPE, NODE_TYPE];
  yield [node, LABEL, l(term_label(represents))];
  // HACK: see note to dot-notate
  yield [node, TERM_TYPE, n(`def:${represents.termType}`)];
}

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
      yield* basic_node_facts(s);
      visited.add(s);
    }
    // yield a DOT node for this object (if not a literal)
    if (is_node(o) && !visited.has(o)) {
      yield* basic_node_facts(o);
      visited.add(o);
    }

    // yield a DOT edge for this triple
    // regarding literals, see note to lib/rdf-js-to-dot.js
    let target = o;
    if (!is_node(o)) {
      target = b();
      yield* basic_node_facts(target, o);
    }
    const edge = b();
    yield [edge, RDF_TYPE, EDGE_TYPE];
    yield [edge, FROM, s];
    yield [edge, TO, target];
    yield [edge, LABEL, l(term_label(p))];
  }
};
