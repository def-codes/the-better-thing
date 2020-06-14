import * as rs from "@thi.ng/rstream";

// Wrapper for stream merge that supports dynamic setting of transform.
// This makes the API much more amenable to use with the system.
const metamerge = id => {
  let current: rs.StreamMerge<any, any>;
  let current_xform;

  const make_merge = (opts?: Partial<rs.StreamMergeOpts<any, any>>) =>
    rs.merge({
      id: `${id} metamerge`,
      closeIn: rs.CloseMode.NEVER,
      ...(opts || {}),
    });

  // Returning the same stream as the current one (which shouldn't happen),
  // will break because it will first unsubscribe it.
  const meta = rs.metaStream<any, any>(
    sub => (current === sub ? null : (current = sub)),
    { id: `${id} metamerge` }
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
    },
  });
};

// Same as metamerge but for sync nodes
const metasync = id => {
  let current: rs.StreamSync<any, any>;
  let current_xform;

  const make_sync = (opts?: Partial<rs.StreamSyncOpts<any, any>>) =>
    rs.sync({ id, closeIn: rs.CloseMode.NEVER, ...opts });

  const meta = rs.metaStream<any, any>(
    sub => (current === sub ? null : (current = sub)),
    { id: `${id} metasync`, closeIn: rs.CloseMode.NEVER }
  );
  meta.next(make_sync());

  return Object.assign(meta, {
    add(source, alias) {
      current.add(source, alias);
    },
    set_transform(xform) {
      if (xform !== current_xform)
        meta.next(make_sync({ src: current.getSources(), xform }));

      current_xform = xform;
    },
  });
};

export default {
  name: "subscriptionDriver",
  init: ({ q }) => ({
    claims: q(
      "Subscribable isa Class",
      // We need a class that does not include Streams
      "Listener subclassOf Subscribable",
      // "listensTo isa Property", // implicit, it has a domain
      "StreamSync subclassOf Subscribable",
      "syncs domain StreamSync",
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
            using: () => metamerge(subject.value),
          },
        }),
      },
      {
        when: q("?subject isa StreamSync"),
        then: ({ subject }) => ({
          register: {
            subject,
            as_type: "Subscribable",
            using: () => metasync(subject.toString()),
          },
        }),
      },
      {
        when: q(
          "?sync isa StreamSync",
          "?impl implements ?sync",
          "?sync syncs ?input",
          "?input alias ?alias",
          "?input source ?source",
          "?sub implements ?source"
        ),
        then: ({ impl, alias, source, sub }, { find }) => {
          find(impl).add(find(sub), alias.value);
          // SIDE EFFECTING!!! TODO
          return {};
        },
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
        },
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
        then: ({ stream, merge }, { find }) => {
          find(merge).add(find(stream));
          return {};
        },
      },
    ],
  }),
};
