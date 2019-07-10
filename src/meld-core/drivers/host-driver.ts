// The host driver supports a vocabulary describing dataflow interop between the
// model and its runtime context.
import rdf from "@def.codes/rdf-data-model";

export default {
  name: "hostDriver",
  init: ({ q }) => ({
    claims: q(
      "ModelHost isa Class",
      "InputPort subclassOf Port",
      "OutputPort subclassOf Port"
      // See note in system.  This doesn't quite work because the target is a
      // literal, not the subscribable resource.
      // "implementsHostInput subpropertyOf implements"
    ),
    rules: [
      {
        comment:
          "host dataflow ingress.  Essentially a shorthand for listening to a system-provided stream.",
        when: q(
          "?subject hostInput ?name",
          "?source implementsHostInput ?name"
        ),
        then: ({ subject, source }) => ({
          assert: [[subject, rdf.namedNode("listensTo"), source]],
        }),
      },

      {
        comment:
          "host dataflow egress.  Output ports are currently only supported for streams.  In principle you could treat any resource as a “reactive variable,” but you get the same effect from viewing the triples.",
        when: q(
          "?subject hostOutput ?name",
          "?source implements ?subject",
          "?source as Subscribable"
        ),
        then: ({ name, subject, source }) => ({
          register_output_port: { subject, source, name: name.value },
        }),
      },
    ],
  }),
};
