// support system for monotonic, rule-based drivers of resource implementations.

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
  //if (query.getState() >= 2 /*DONE*/)
  query.unsubscribe();
  return results;
};

const live_query = (store, where) =>
  store.addQueryFromSpec({
    q: [{ where: where.map(_ => _.map(rstream_variables)) }]
  });

const drivers = [];
const register_driver = (name, init) => drivers.push(init({ q }));

const HANDLERS = {
  register_output_port({ name, subject, source }, system) {
    system.register_output_port(name, subject, source);
  },
  register({ subject, as_type, thunk }, system) {
    system.register(subject, as_type, thunk);
  },
  warning({ message, context }) {
    console.warn(message, context);
  }
};

const process_effect_definition = (type, def, system) => {
  const handler = HANDLERS[type];
  if (!handler) {
    // This works (catches in “problem applying rule”)
    // throw `Undefined message type ${type}`;
    // but this is more informational
    console.warn(`Undefined message type ${type}`, { type, def });
    // could also say which driver this is from
  }
  handler(def, system);
};

const make_consequent_handler = (then, helpers, system, all) => results => {
  if (!results) return;

  const output = all
    ? [then(results, helpers)]
    : Array.from(results, result => then(result, helpers));

  // handlers can return a dictionary of definitions, where each definition is
  // an object describing it, or an array of objects describing it.
  if (output)
    for (const definitions of Array.isArray(output) ? output : [output])
      for (const [key, value] of Object.entries(definitions))
        for (const def of Array.isArray(value) ? value : [value])
          process_effect_definition(key, def, system);
};

// behavior is undefined if store is not empty
// returns a bunch of subscriptions
const apply_drivers_to = (store, helpers, system) => {
  const subs = [];
  for (const { claims, rules } of drivers) {
    store.into(claims);
    for (const { when, when_all, then } of rules)
      subs.push(
        live_query(store, when || when_all).subscribe({
          next: make_consequent_handler(then, helpers, system, !!when_all),
          // TODO: formally indicate source
          error: error => console.error("problem appying rule: ", when, error)
        })
      );
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
const monotonic_system = ({ id, store, dom_root, ports }) => {
  const registry = new thi.ng.associative.EquivMap();

  // The interface made available to drivers
  //
  // TEMP: Changing handlers to return side-effect descriptions.  Read-only
  // facilities will be added as needed.
  const driver_helpers = { store };
  const system = {
    store,
    dom_root,
    register_input_port: () => {
      /* TBD */
    },
    register_output_port: (name, subject, source) => {
      const stream = system.find(source);
      ports.add(name, stream);
    },
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

  const rule_subscriptions = apply_drivers_to(store, driver_helpers, system);

  return function dispose() {
    for (const sub of rule_subscriptions) if (sub) sub.unsubscribe();
  };
};

var meld = { monotonic_system, register_driver };
