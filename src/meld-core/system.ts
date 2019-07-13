// support system for monotonic, rule-based drivers of resource implementations.
import { EquivMap } from "@thi.ng/associative";
import rdf from "@def.codes/rdf-data-model";
import { NamedNode } from "@def.codes/rdf-data-model";
import { IStream } from "@thi.ng/rstream";

// =============== RDF helpers

const AS = rdf.namedNode("as"); // for runtime only
const VALUE = rdf.namedNode("value"); // s/b rdf:value
const IMPLEMENTS = rdf.namedNode("implements"); // s/b meld:

const mint_blank = () => rdf.blankNode();

/** Replace variables with new blank nodes in the given triples. */
// Using rstream-style (array) triples with RDF.js terms.
export const sub_blank_nodes = triples => {
  const map = new Map();
  const sub = term => {
    if (term.termType === "Variable") {
      if (!map.has(term.value)) map.set(term.value, mint_blank());
      return map.get(term.value);
    }
    return term;
  };
  // Covers predicate for good measure but only expecting vars in s & o pos's.
  return triples.map(triple => triple.map(sub));
};

// ================================= WORLD / INTERPRETER

// Used by other support functions.
const is_node = term =>
  term.termType === "NamedNode" || term.termType === "BlankNode";

const is_variable = term => term.termType === "Variable";

const has_open_variables = triples =>
  triples.some(triple => triple.some(is_variable));

// Helper (for drivers) to make RDF terms from clauses as written.
const q = (...clauses: string[]) =>
  clauses.map(clause =>
    clause.split(/\s+/).map(term =>
      term.startsWith("?")
        ? rdf.variable(term.slice(1))
        : // Clever but didn't end up getting used
        term.startsWith('"') && term.endsWith('"')
        ? rdf.literal(term.slice(1, -1))
        : rdf.namedNode(term)
    )
  );

const rstream_variables = term =>
  term.termType === "Variable" ? `?${term.value}` : term;

// Helper function for TripleStore to get results of a query immediately.
const sync_query = (store, where) => {
  let results;
  const query = store
    .addQueryFromSpec({
      q: [{ where: where.map(_ => _.map(rstream_variables)) }],
    })
    .subscribe({ next: result_set => (results = result_set) });
  // TODO: Currently, unsubscribing any query makes it impossible to add others,
  // due to the transitive closing of shared streams.  See
  // https://github.com/thi-ng/umbrella/issues/91
  // query.unsubscribe();
  return results;
};

const live_query = (store, where) =>
  store.addQueryFromSpec({
    q: [{ where: where.map(_ => _.map(rstream_variables)) }],
  });

const drivers = [];
export const register_driver = (name, init) =>
  drivers.push(init({ q, is_node }));

const HANDLERS = {
  // When the asserted triples contain open variables (i.e. any variable terms),
  // this treats them as a “there exists” assertion.
  assert(triples, system) {
    if (has_open_variables(triples)) {
      const existing = sync_query(system.store, triples);
      if (!existing || existing.size === 0)
        system.assert_all(sub_blank_nodes(triples));
    } else system.assert_all(triples);
  },
  register_output_port({ name, subject, source }, system) {
    system.register_output_port(name, subject, source);
  },
  // TODO: this key should be `using`.  change call sites
  register({ subject, as_type, get: using }, system) {
    system.register(subject, as_type, using);
  },
  warning({ message, context }) {
    console.warn(message, context);
  },
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
        process_effect_definition(key, value, system);
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
          error: error => console.error("problem appying rule: ", when, error),
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
export const monotonic_system = ({ id, store, dom_root, ports }) => {
  const registry = new EquivMap();

  // For use in REPL.
  window["system"] = { store, registry };

  const find = subject => registry.get(subject);

  const register_object = (object, type: NamedNode) => {
    const object_id = mint_blank();
    registry.set(object_id, object);
    store.add([object_id, AS, type]);
    return object_id;
  };

  const unstable_live_query = where => live_query(store, where);

  // The interface made available to drivers
  //
  // TEMP: Changing handlers to return side-effect descriptions.  Read-only
  // facilities will be added as needed.
  const driver_helpers = {
    store,
    find,
    unstable_live_query,
  };
  const system = {
    store,
    find,
    register_input_port: (name: string, stream: IStream<any>) => {
      const impl = register_object(stream, rdf.namedNode("Subscribable"));
      //  This is wack.  listensTo rule doesn't fire unless the source node
      //  IMPLEMENTS the resource associated with the dataflow node.  But in
      //  this case, they are the same thing.
      store.add([impl, IMPLEMENTS, impl]);
      store.add([
        impl,
        rdf.namedNode("implementsHostInput"),
        rdf.literal(name),
      ]);
    },
    register_output_port: (name, subject, source) => {
      const stream = system.find(source);
      ports.add_output(name, stream);
    },
    assert_all: facts => store.into(facts),
    query_all: where => sync_query(store, where),

    // A single resource can be “implemented” once for each type.  This allows
    // drivers to disambiguate the role for which they are querying
    // implementations.
    register(subject, type_name, using) {
      const type = rdf.namedNode(type_name);
      if (!registry.has([subject, type])) {
        let object;
        try {
          object = using();
        } catch (error) {
          // Should also know driver/rule source here.
          console.error(
            `Error getting value for ${subject.value} as type ${type_name}`,
            error
          );
          return;
        }

        register_object(object, type);

        // I won't judge you for using this.
        // if (type_name === "Subscribable") {
        //   value.subscribe(
        //     tx.sideEffect(value =>
        //       console.orig.log(subject.value, "DEBUG", value)
        //     )
        //   );
        // }
        registry.set([subject, type], object);
        const object_id = register_object(object, type);
        store.add([object_id, IMPLEMENTS, subject]);
      }
    },
  };

  // Feels like this should be done in "world"
  ports.input_added.subscribe({
    next({ name, stream }) {
      system.register_input_port(name, stream);
    },
  });

  if (dom_root) {
    const n = rdf.namedNode;
    // system.assert([n("home"), n("isa"), n("ModelDomRoot")]);
    system.register(n("home"), "Container", () => dom_root);
  }

  const rule_subscriptions = apply_drivers_to(store, driver_helpers, system);

  return function dispose() {
    for (const sub of rule_subscriptions) if (sub) sub.unsubscribe();
  };
};
