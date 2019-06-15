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

// given a store, create a subscription that yields all of the resources it
// talks about, i.e. every named or blank node in a subject or object position.
const resources_in = store =>
  store
    .addQueryFromSpec({
      q: [{ where: [["?subject", "?predicate", "?object"]] }]
    })
    .transform(
      tx.map(triples =>
        tx.transduce(
          tx.comp(
            tx.multiplex(tx.pluck("subject"), tx.pluck("object")),
            tx.cat(),
            tx.filter(is_node),
            // This can't be doing anything after the above filter
            tx.keep()
          ),
          tx.conj(),
          triples
        )
      )
    );

function foo() {
  // a set of the resources in the store, (in subject or object position)
  const model_resources = rs.metaStream(
    store => resources_in(store),
    `${model_id}/store`
  );

  // the resource metastream is based on the store
  model_store.subscribe(model_resources);

  // select all properties (triples) from the model that point to resources
  const model_properties = model_store.transform(
    tx.map(store => [...tx.filter(([, , o]) => is_node(o), store.triples)])
  );
}
