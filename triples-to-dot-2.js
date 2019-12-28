const { DOT, TYPES } = require("@def.codes/graphviz-format");
const { NODE, EDGE, GRAPH } = TYPES;

// THIS is also in meld-core/system
const is_node = term =>
  term.termType === "NamedNode" || term.termType === "BlankNode";

const is_dot_term = term => term.value.startsWith(DOT);

const FROM = `${DOT}from`;
const TO = `${DOT}to`;

// quick and dirty. this should be done through queries
// doesn't handle clusters, etc
function* rdfjs_store_to_dot_statements_2(store) {
  // i.e. DESCRIBE
  const subjects = new Map();
  for (const [subject, predicate, object] of store) {
    if (!subjects.has(subject)) subjects.set(subject, {});
    subjects.get(subject)[predicate.value] = object;
  }

  for (const [subject, properties] of subjects) {
    // using CURIE for now
    if (properties["rdf:type"].value === NODE) {
      const attributes = {};
      for (const [property, object] of Object.entries(properties))
        if (property.startsWith(DOT))
          attributes[property.slice(DOT.length)] = object.value;

      yield { type: "node", id: subject.value, attributes };
    } else if (properties["rdf:type"].value === EDGE) {
      const attributes = {};
      for (const [property, object] of Object.entries(properties))
        if (property.startsWith(DOT) && ![FROM, TO].includes(property))
          attributes[property.slice(DOT.length)] = object.value;

      yield {
        type: "edge",
        from: properties[FROM].value,
        to: properties[TO].value,
        attributes,
      };
    }
  }

  // if (is_node(object.termType))
  //   yield { type: "edge", from: subject.value, to: object.value };
}

const { TripleStore } = require("@thi.ng/rstream-query");
const { make_identity_factory } = require("@def.codes/rdf-data-model");
const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l } = factory;

const store = new TripleStore();
store.add([n("dolphins"), n(`rdf:type`), n(NODE)]);
store.add([n("dolphins"), n(`${DOT}shape`), l("circle")]);
store.add([n("breath"), n(`rdf:type`), n(NODE)]);
store.add([n("breath"), n(`${DOT}shape`), l("circle")]);
const dolphin_breath = b();
store.add([dolphin_breath, n(`rdf:type`), n(EDGE)]);
store.add([dolphin_breath, n(`${DOT}from`), n("dolphins")]);
store.add([dolphin_breath, n(`${DOT}to`), n("breath")]);
store.add([dolphin_breath, n(`${DOT}style`), l("dotted")]);

//const dot_statements = [{ type: "node", id: "foo" }];
// const dot_statements = [...rdfjs_store_to_dot_statements(store)];

const { rdfjs_store_to_dot_statements } = require("./lib/rdf-js-to-dot");

exports.display = { dot_statements: [...rdfjs_store_to_dot_statements(store)] };

// exports.display = { dot_statements };
