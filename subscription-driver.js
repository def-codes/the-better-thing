(function() {
  const NAME = "streamDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  const { rstream: rs, transducers: tx } = thi.ng;

  // Wrapper for stream merge that supports dynamic setting of transform.
  // This makes the API much more amenable to use with the system.
  const metamerge = () => {
    let current = rs.merge();

    const meta = rs.metaStream(sub => (current = sub));
    meta.next(current);

    return Object.assign(meta, {
      add: (...args) => current.add(...args),
      set_transform(xform) {
        meta.next(rs.merge({ src: current.sources.keys(), xform }));
      }
    });
  };

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
          register: { subject, as_type: "Subscribable", get: () => metamerge() }
        })
      },
      {
        when: q(
          "?subject transformsWith ?transform",
          "?transducer implements ?transform",
          "?transducer as Transducer",
          "?metamerge implements ?subject",
          "?metamerge as Subscribable" // subscription would make more sense here...
        ),
        then: ({ transducer, metamerge }, { find }) => {
          // Logging the metamerge instances crashes, probably the value render.
          // Could be related to IDeref?
          find(metamerge).set_transform(find(transducer));
          // SIDE EFFECTING!!! TODO
          return {};
        }
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
