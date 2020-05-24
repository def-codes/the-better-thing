define(["@def.codes/amd-basic-support", "@thi.ng/rstream"], (basic, rs) => {
  const { namespace, memoized_namespace } = basic;
  const { subscription } = rs;

  const OPTS = { closeOut: rs.CloseMode.NEVER };

  /**
   * Hub for coordinating providers and consumers of subscriptions.  Provides a
   * map-compatible interface where all requests return subscriptions.  which
   * emit values as they are set.
   */
  // PROBLEMS:
  //
  // - This is not symmetrical.  `set` takes values but `get` returns
  //   subscriptions.
  //
  // - You can't actually provide a subscription as the value for a key---they
  //   all have to originate here.  This is good in that it means you know the
  //   provenance of all of the subscriptions.  It also means that you can
  //   guarantee that the streams will be persistent, which is supposed to be an
  //   invariant.

  const subscription_namespace = () => {
    const base = namespace();
    // New key is something we'd like on collections generally as a way of being
    // observable.  We don't have rstream where memoize_namespace is defined.
    // Trying this out, anyway.
    const new_key = subscription(OPTS);
    // This is a somewhat convoluted implementation of ‘new key’ .  We know the
    // base won't be called unless a new key is being set (because of memoize).
    const store = Object.create(base, {
      set: {
        value(key, value) {
          base.set(key, value);
          new_key.next(key);
          return this;
        },
        writable: true,
      },
    });
    const cache = memoized_namespace(store, key => subscription(key, OPTS));
    return Object.assign(cache, {
      new_key,
      set(key, value) {
        cache.get(key).next(value);
        return this;
      },
    });
  };

  return { subscription_namespace };
});
