const { traverse } = require("@def.codes/graphs");
const {
  make_object_graph_traversal_spec,
} = require("@def.codes/node-web-presentation");
const { make_identity_factory } = require("@def.codes/rdf-data-model");

const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l } = factory;

// in nwp
const is_reference_type = x =>
  x && (typeof x === "object" || typeof x === "function");

exports.rdf_js_traversal = function*(thing) {
  const spec = make_object_graph_traversal_spec();
  for (const { subject, object, value, data } of traverse([thing], spec))
    if (object != null) yield [b(subject), n(data), b(object)];
    else if (typeof value === "object")
      for (const [k, v] of Object.entries(value))
        if (!is_reference_type(v)) yield [b(subject), n(k), l(v)];
};
