// Convert resources to objects.  Higher-level than triples, but still doesn't
// mean anything in its own right.  Basically it's like JSON-LD support.  keys
// may include namespaces.
const to_node_dict = store =>
  tx.transduce(
    tx.map(([id, props]) => [
      id,
      tx.transduce(
        tx.map(idx => store.triples[idx]),
        tx.groupByObj({
          key: ([, p]) => p,
          // This is a wonky reducer... the value is an array if there's more
          // than one, and not otherwise.  How else do we know whether to expect
          // multiple values?  Also, if you're going to do this, it should be a
          // Set, not an array.
          group: tx.reducer(
            () => undefined,
            (acc, [, , o]) => (acc === undefined ? o : [...acc, o])
          )
        }),
        props
      )
    ]),
    tx.assocObj(),
    store.indexS
  );
