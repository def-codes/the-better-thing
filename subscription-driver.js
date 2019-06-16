(function() {
  const NAME = "streamDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  const { rstream: rs, transducers: tx } = thi.ng;

  meld.register_driver(NAME, ({ q }) => ({
    claims: q(
      "Subscribable isa Class",
      "listensTo isa Property",
      // In effect, we implement these with StreamMerge
      // StreamSync will have to be its own thing with its own descriptions
      "listensTo domain Subscribable"
      // "listensTo range Listener"
    ),
    rules: [
      {
        // Should be implied by listensTo
        when: q("?subject isa Subscribable"),
        then: ({ subject }) => ({
          register: { subject, as_type: "Subscribable", get: () => rs.merge() }
        })
      },
      {
        comment:
          "See https://github.com/thi-ng/umbrella/tree/master/packages/rstream#stream-merging",
        when: q(
          "?subject listensTo ?source",
          "?merge implements ?subject",
          "?merge as Subscribable",
          "?stream implements ?source",
          "?stream as Subscribable"
        ),
        // SIDE EFFECTING!  how to avoid this?
        then: ({ subject, stream, merge }, { find }) => {
          // Luckily, merge.sources is a Map, so adding the same stream multiple
          // times is a no-op.  Note that adding also subscribes.
          //
          // Interestingly, you merge will also add any stream sent to it as
          // input, so merge.next should also work here.
          find(merge).add(find(stream));
          return {};
        }
      }
    ]
  }));
})();
