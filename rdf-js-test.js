const tx = require("@thi.ng/transducers");
const { TripleStore } = require("@thi.ng/rstream-query");
const { make_identity_factory } = require("@def.codes/rdf-data-model");
const dot = require("@def.codes/graphviz-format");

const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l } = factory;

const store = new TripleStore();
store.add([n("Bob"), n("age"), l(35, n("xsd:integer"))]);
store.add([n("Bob"), n("fatherOf"), n("Joe")]);
store.add([n("Alice"), n("hasSpouse"), n("Bob")]);
store.add([n("Bob"), n("hasSpouse"), n("Alice")]);
store.add([n("Jill"), n("loves"), n("Alice")]);

// THIS is also in meld-core/system
const is_node = term =>
  term.termType === "NamedNode" || term.termType === "BlankNode";

function* rdfjs_store_to_dot_statements(store) {
  for (const [subject, predicate, object] of store) {
    yield {
      type: "node",
      id: subject.value,
      attributes: {
        // this is where the magic happens
      },
    };

    // RDF supports terms that are not nodes as such: literals and (in some
    // contexts) variables, which are just named placeholders.  In both cases,
    // instances are situational.  That is, multiple instances of equivalent
    // terms are notated distinctly.  Notating these terms as nodes means that
    // the dot graph must contain id's not belonging to the graph being
    // displayed.  We can use the bnode generator to create unique id's for
    // these pseudo-nodes.
    const target = is_node(object) ? object : b();

    if (!is_node(object))
      yield {
        type: "node",
        id: target.value,
        attributes: {
          // label: object.value,
          shape: "none",
          label: object.toString(),
          // xlabel: object.language || object.datatype.value,
        },
      };

    yield {
      type: "edge",
      from: subject.value,
      to: target.value,
      attributes: {
        label: predicate.value,
        style: !is_node(object) && "dashed",
      },
    };
  }
}

exports.display = { dot_statements: [...rdfjs_store_to_dot_statements(store)] };
