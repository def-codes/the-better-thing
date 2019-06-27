// support system for monotonic, rule-based drivers of resource implementations.
import rdf from "./rdf.mjs";

// Hack for browser/node support
import * as rs1 from "../node_modules/@thi.ng/rstream/lib/index.umd.js";
import * as tx1 from "../node_modules/@thi.ng/transducers/lib/index.umd.js";
import * as ass1 from "../node_modules/@thi.ng/transducers/lib/index.umd.js";
const rs = Object.keys(rs1).length ? rs1 : thi.ng.rstream;
const tx = Object.keys(tx1).length ? tx1 : thi.ng.transducers;
const associative = Object.keys(ass1).length ? ass1 : thi.ng.associative;

// =============== RDF helpers

const AS = rdf.namedNode("as"); // for runtime only
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
  query.unsubscribe();
  return results;
};

const live_query = (store, where) =>
  store.addQueryFromSpec({
    q: [{ where: where.map(_ => _.map(rstream_variables)) }]
  });

const drivers = [];
export const register_driver = (name, init) =>
  drivers.push(init({ q, is_node }));

const HANDLERS = {
  assert(facts, system) {
    system.assert_all(facts);
  },
  register_output_port({ name, subject, source }, system) {
    system.register_output_port(name, subject, source);
  },
  register({ subject, as_type, get }, system) {
    system.register(subject, as_type, get);
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
export const monotonic_system = ({ id, store, dom_root, ports }) => {
  const registry = new associative.EquivMap();

  // If you need this, Godspeed.
  // window.system = { store, registry };

  const find = subject => registry.get(subject);

  const unstable_live_query = where => live_query(store, where);

  // The interface made available to drivers
  //
  // TEMP: Changing handlers to return side-effect descriptions.  Read-only
  // facilities will be added as needed.
  const driver_helpers = {
    store,
    find,
    unstable_live_query
  };
  const system = {
    store,
    find,
    register_input_port: () => {
      /* TBD */
    },
    register_output_port: (name, subject, source) => {
      const stream = system.find(source);
      ports.add(name, stream);
    },
    assert_all: facts => store.into(facts),
    query_all: where => sync_query(store, where),

    // A single resource can be “implemented” once for each type.  This allows
    // drivers to disambiguate the role for which they are querying
    // implementations.
    register(subject, type_name, get) {
      const type = rdf.namedNode(type_name);
      if (!registry.has([subject, type])) {
        let value;
        try {
          value = get();
        } catch (error) {
          // Should also know driver/rule source here.
          console.error(
            `Error getting value for ${subject.value} as type ${type_name}`,
            error
          );
          return;
        }

        // I won't judge you for using this.
        // if (type_name === "Subscribable") {
        //   value.subscribe(
        //     tx.sideEffect(value =>
        //       console.orig.log(subject.value, "DEBUG", value)
        //     )
        //   );
        // }

        const value_id = mint_blank();
        //console.log(value, value_id, IMPLEMENTS, subject);

        store.add([value_id, AS, type]);
        registry.set(value_id, value);
        registry.set([subject, type], value);
        store.add([value_id, IMPLEMENTS, subject]);
      }
    }
  };

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
