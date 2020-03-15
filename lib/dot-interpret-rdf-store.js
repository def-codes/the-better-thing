const { DOT, TYPES } = require("@def.codes/graphviz-format");
const { NODE, EDGE } = TYPES;

// THIS is also in meld-core/system
const is_node = term =>
  term.termType === "NamedNode" || term.termType === "BlankNode";

const is_dot_term = term => term.value.startsWith(DOT);

const FROM = `${DOT}from`;
const TO = `${DOT}to`;

// quick and dirty. this should be done through queries
// doesn't handle clusters, etc
exports.dot_interpret_rdf_store = function*(store) {
  // i.e. DESCRIBE
  const subjects = new Map();
  for (const [subject, predicate, object] of store) {
    if (!subjects.has(subject)) subjects.set(subject, {});
    subjects.get(subject)[predicate.value] = object;
  }

  for (const [subject, properties] of subjects) {
    // using CURIE for now
    const type = properties["rdf:type"] && properties["rdf:type"].value;

    if (type === NODE) {
      const attributes = {};
      for (const [property, object] of Object.entries(properties))
        if (property.startsWith(DOT))
          attributes[property.slice(DOT.length)] = object.value;
      const id = subject.value;

      yield {
        type: "node",
        id,
        attributes: {
          style: "filled",
          color: "transparent",
          ...attributes,
          href: attributes.href || `http://example.com/${id}`,
        },
      };
    } else if (type === EDGE) {
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
};
