import * as rs from "@thi.ng/rstream";

// Wrapper for stream merge that supports dynamic setting of transform.
// This makes the API much more amenable to use with the system.
const metamerge = id => {
  let current;
  let current_xform;

  const make_merge = opts => {
    const merge = rs.merge({ id: `${id} merge`, close: false, ...opts });
    // DUMMY subscription.  This prevents the merge from unsubscribing its
    // sources when it's being swapped out in the meta-stream.  If we had to
    // truly tear down this node (e.g. for non-monotonic dataflows), we'd want
    // to unsubscribe this as well.  A way to opt out of this behavior is
    // under consideration: https://github.com/thi-ng/umbrella/issues/74
    merge.subscribe({}, `dummy for ${id} merge`);
    return merge;
  };

  // Returning the same stream as the current one (which shouldn't happen),
  // will break because it will first unsubscribe it.
  const meta = rs.metaStream(
    // @ts-ignore
    sub => (current === sub ? null : (current = sub)),
    `${id} metamerge`
  );
  // @ts-ignore
  meta.next(make_merge());

  return Object.assign(meta, {
    // You MUST NOT add the same source to a `StreamMerge`.  It does not check
    // for duplicates, and repeat subscribers will result in bad behavior.
    add: sub => {
      if (!current.sources.has(sub)) current.add(sub);
    },
    set_transform(xform) {
      // Don't rebuild if transform hasn't really changed, in case that's not
      // prevented upstream.
      if (xform !== current_xform)
        meta.next(make_merge({ src: [...current.sources.keys()], xform }));

      current_xform = xform;
    }
  });
};

export default {
  name: "subscriptionDriver",
  init: ({ q }) => ({
    claims: q(
      "Subscribable isa Class",
      // We need a class that does not include Streams
      "Listener subclassOf Subscribable",
      "listensTo isa Property",
      // In effect, we implement these with StreamMerge
      // StreamSync will have to be its own thing with its own descriptions
      "listensTo domain Listener"
      // "listensTo range Subscribable"
    ),
    rules: [
      {
        when: q("?subject isa Listener"),
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
        // SIDE EFFECTING!  I'm avoiding adding a "side_effect" return type, but
        // in this case we're not registering a value.  We *do* need to avoid
        // adding the stream multiple times for the same instance of this rule
        // (i.e. resource pair), but that is currently handled by the metamerge.
        //
        // Note that adding also subscribes.
        then: ({ subject, source, stream, merge }, { find }) => {
          find(merge).add(find(stream));
          return {};
        }
      }
    ]
  })
};
