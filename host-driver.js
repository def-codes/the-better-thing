// The host driver supports a vocabulary describing dataflow interop between the
// model and its runtime context.
(function() {
  const NAME = "hostDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  meld.register_driver(NAME, ({ q }) => ({
    claims: q(
      "ModelHost isa Class",
      "InputPort subclassOf Port",
      "OutputPort subclassOf Port"
    ),
    rules: [
      {
        when: q("?ingress isa InputPort"),
        then: ({ ingress }) => ({
          // TBD
        })
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
          register_output_port: { subject, source, name: name.value }
        })
      }
    ]
  }));
})();
