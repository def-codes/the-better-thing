// support system for simple, rule-based drivers of resource implementations.
// monotonic: uses destroy-the-world semantics.

const { transducers: tx, rstream: rs, hdom } = thi.ng;
const { updateDOM } = thi.ng.transducersHdom;

// =============== RDF helpers

const AS = rdf.namedNode("as"); // for runtime only
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

const drivers = [];
const register_driver = (name, init) => {
  const driver = init({ q });
  console.log(`drive`, driver);

  drivers.push(driver);
};

// behavior is undefined if store is not empty
// returns a bunch of subscriptions
const apply_drivers_to = (store, system) => {
  const subs = [];
  for (const { claims, rules } of drivers) {
    store.into(claims);
    for (const { when, when_all, then } of rules)
      try {
        subs.push(
          live_query(store, when || when_all).subscribe({
            next(results) {
              console.log(`line 110`);

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

/**
 * A monotonic, knowledge-based system.
 *
 * @param {string} id - Provisional.  Namespace if there were more than one.
 * @param {TripleStore} store - Should be an empty knowledge base.
 * @param {Node} dom_root - Document node to be owned by the model.
 *
 * @returns {Function} (Provisional) dispose method.
 */
const monotonic_system = ({ id, store, dom_root }) => {
  const registry = new thi.ng.associative.EquivMap();

  // The interface made available to drivers
  const for_drivers = {
    store,
    dom_root,
    assert: fact => store.add(fact),
    query_all: where => sync_query(store, where),
    live_query: where => live_query(store, where),
    find: subject => registry.get(subject),

    // A single resource can be “implemented” once for each type.  This allows
    // drivers to disambiguate the role for which they are querying
    // implementations.
    register(subject, type_name, thunk) {
      const type = rdf.namedNode(type_name);
      if (!registry.has([subject, type])) {
        const value = thunk();
        const value_id = mint_blank();
        //console.log(value, value_id, IMPLEMENTS, subject);

        store.add([value_id, AS, type]);
        registry.set(value_id, value);
        registry.set([subject, type], value);
        store.add([value_id, IMPLEMENTS, subject]);
      }
    }
  };

  const rule_subscriptions = apply_drivers_to(store, for_drivers);

  return function dispose() {
    for (const sub of rule_subscriptions) if (sub) sub.unsubscribe();
  };
};

var meld = { monotonic_system, register_driver };
