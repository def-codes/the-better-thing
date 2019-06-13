// support system for simple, rule-based drivers of resource implementations.
// monotonic: uses destroy-the-world semantics.

const { transducers: tx, rstream: rs, hdom } = thi.ng;
const { updateDOM } = thi.ng.transducersHdom;

const drivers = [];
const register_driver = driver => drivers.push(driver);

// =============== RDF helpers

const TYPE = rdf.namedNode("isa"); // s/b rdf:type
const VALUE = rdf.namedNode("value"); // s/b rdf:value
const IMPLEMENTS = rdf.namedNode("implements"); // s/b meld:

const mint_blank = () => rdf.blankNode();

// Used by other support functions.
const is_node = term =>
  term.termType === "NamedNode" || term.termType === "BlankNode";

// Helper (for drivers) to make RDF terms from clauses as written.
const q = (...clauses) =>
  clauses.map(clause =>
    clause
      .split(/\s+/)
      .map(term =>
        term[0] === "?" ? rdf.variable(term.slice(1)) : rdf.namedNode(term)
      )
  );

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

const rstream_variables = term =>
  term.termType === "Variable" ? `?${term.value}` : term;

// Helper function for TripleStore to get results of a query immediately.
const sync_query = (store, where) => {
  let results;
  const query = store
    .addQueryFromSpec({
      q: [{ where: where.map(_ => _.map(rstream_variables)) }]
    })
    .subscribe({ next: result_set => (results = result_set) });
  // This is tricky, I think because of cached queries
  // if (query.getState() >= 2 /*DONE*/) query.unsubscribe();
  return results;
};

const live_query = (store, where) =>
  store.addQueryFromSpec({
    q: [{ where: where.map(_ => _.map(rstream_variables)) }]
  });
//.transform(tx.trace(JSON.stringify(where)));

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

// behavior is undefined if store is not empty
// returns a bunch of subscriptions
// sync version below probably garbage
const apply_drivers_to = (store, system) => {
  const subs = [];
  for (const { claims, rules } of drivers) {
    store.into(claims);
    for (const { when, when_all, then } of rules)
      try {
        subs.push(
          live_query(store, when || when_all).subscribe({
            next(results) {
              if (results) {
                if (when_all) then(results, system);
                else for (const result of results) then(result, system);
              }
            }
          })
        );
      } catch (error) {
        console.error("problem appying rule: ", when, error);
      }
  }
  return subs;
};

// behavior is undefined if store is not empty
const sync_apply_drivers_to = (store, system) => {
  for (const { claims, rules } of drivers) {
    store.into(claims);
    for (const { when, when_all, then } of rules)
      try {
        const results = sync_query(store, when || when_all);
        if (results) {
          if (when_all) then(results, system);
          else for (const result of results) then(result, system);
        }
      } catch (error) {
        console.error("problem appying rule: ", when, error);
      }
  }
};

/**
 * A self-contained, monotonic system.  It can “change” internally in
 * forward-only kind of way, but once created it cannot be communicated with
 * from the outside.
 *
 * @param {string} id - Provisional.  Namespace if there were more than one.
 * @param {TripleStore} store - Should be an empty knowledge base.
 * @param {Node} dom_root - Document node to be owned by the model.
 *
 * @returns {Function} (Provisional) dispose method.
 */
const monotonic_system = ({ id, store, dom_root }) => {
  const registry = new Map();

  // The interface made available to drivers
  const system = {
    store,
    dom_root,
    assert: fact => store.add(fact),
    query_all: where => sync_query(store, where),
    live_query: where => live_query(store, where),
    find: subject => registry.get(subject),
    register(subject, thunk) {
      if (!registry.has(subject)) {
        // Theoretically it's possible for multiple drivers to implement
        // different types for the same resource.  To support that, the blank
        // node (and probably a tuple key) will be needed to distinguish them.
        const value = thunk();
        const value_id = mint_blank();
        //console.log(value, value_id, IMPLEMENTS, subject);

        registry.set(value_id, value);
        registry.set(subject, value);
        store.add([value_id, IMPLEMENTS, subject]);
      }
    }
  };

  const rule_subscriptions = apply_drivers_to(store, system);

  return function dispose() {
    for (const sub of rule_subscriptions) if (sub) sub.unsubscribe();
  };
};

var meld = { monotonic_system, register_driver };
