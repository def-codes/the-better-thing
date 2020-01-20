// TRANSITIONAL, for convenience while bootstrapping

const { make_identity_factory } = require("@def.codes/rdf-data-model");
const { blankNode: b } = make_identity_factory();

// THIS is also in meld-core/system
const is_node = term =>
  term.termType === "NamedNode" || term.termType === "BlankNode";

exports.rdfjs_store_to_dot_statements = function*(store) {
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
    //
    // Re variables, the only graphs with variables should be templates.  When
    // viewing a template as a graph, you very much want variables to be
    // treated as nodes.
    const treat_as_node = is_node(object) || object.termType === "Variable";
    const target = treat_as_node ? object : b();

    if (!treat_as_node)
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
};
