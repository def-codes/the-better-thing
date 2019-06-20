(function() {
  const NAME = "streamDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  const { rstream: rs, transducers: tx } = thi.ng;

  // Wrapper for stream merge that supports dynamic setting of transform.
  // This makes the API much more amenable to use with the system.
  const metamerge = id => {
    let current = rs.merge({ id: `${id} merge`, close: false });
    let current_xform;

    // Returning the same stream as the current one (which shouldn't happen),
    // will break because it will first unsubscribe it.
    const meta = rs.metaStream(
      sub => (current === sub ? null : (current = sub)),
      `${id} metamerge`
    );
    meta.next(current);

    return Object.assign(meta, {
      add: (...args) => current.add(...args),
      set_transform(xform) {
        // Don't rebuild if transform hasn't really changed, in case that's not
        // prevented upstream.
        if (xform !== current_xform)
          meta.next(
            rs.merge({ src: [...current.sources.keys()], xform, close: false })
          );
        current_xform = xform;
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
          register: {
            subject,
            as_type: "Subscribable",
            get: () => metamerge(subject.value)
          }
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
          // TODO: how to short-circuit this so that it won't be called with
          // identical values?
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
          // Interestingly, merge will also add any stream sent to it as input,
          // so merge.next should also work here.
          find(merge).add(find(stream));
          return {};
        }
      }
    ]
  }));
})();
