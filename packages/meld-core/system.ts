// support system for monotonic, rule-based drivers of resource implementations.
import rdf from "@def.codes/rdf-data-model";
import { IStream } from "@thi.ng/rstream";
import { Registry } from "./registry";
import {
  live_query,
  sync_query,
  PseudoTriples,
  IRDFTripleSource,
  IRDFTripleSink,
} from "@def.codes/rstream-query-rdf";

// =============== RDF helpers

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

// When the asserted triples contain open variables (i.e. any variable terms),
// this treats them as a “there exists” assertion.
const expand = (source: IRDFTripleSource, triples: PseudoTriples) => {
  if (has_open_variables(triples)) {
    const existing = sync_query(source, triples);
    if (!existing || existing.size === 0) return sub_blank_nodes(triples);
  } else return triples;
};

// ================================= WORLD / INTERPRETER

// Used by other support functions.
const is_node = term =>
  term.termType === "NamedNode" || term.termType === "BlankNode";

const is_variable = term => term.termType === "Variable";

const has_open_variables = triples =>
  triples.some(triple => triple.some(is_variable));

// Helper (for drivers) to make RDF terms from clauses as written.

const NUMBER = /^\d+(\.\d+)?$/;
export const q11 = (term: string) =>
  term.startsWith("?")
    ? rdf.variable(term.slice(1))
    : term.startsWith("_:")
    ? rdf.blankNode(term.slice(2))
    : term.startsWith('"') && term.endsWith('"')
    ? rdf.literal(term.slice(1, -1))
    : NUMBER.test(term)
    ? // Provisional, I don't think runtime value is used anywhere
      Object.assign(rdf.literal(term /* xsd datatype, etc */), {
        runtimeValue: parseFloat(term),
      })
    : rdf.namedNode(term);

export const q1 = (clause: string) => clause.split(/\s+/).map(q11);

export const q = (...clauses: (string | string[])[]) =>
  clauses.map(item => (Array.isArray(item) ? item.map(q1) : q1(item)));

const driver_dictionary = new Map();
export const register_driver = (name, init) =>
  driver_dictionary.set(name, init({ q, is_node, rdf }));

const HANDLERS = {
  assert(triples, system) {
    const expanded = expand(system.source, triples);
    if (expanded) system.assert_all(expanded);
  },
  register_output_port({ name, subject, source }, system) {
    system.register_output_port(name, subject, source);
  },
  register({ subject, as_type, using }, system) {
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
  // console.log(`output`, output);

  for (const definitions of Array.isArray(output) ? output : [output]) {
    if (!definitions) {
      console.warn(
        `No result from handler.  Are you writing a side-effecting driver???`,
        then.toString()
      );
      return;
    }

    for (const [key, value] of Object.entries(definitions)) {
      // Diagnostics
      const start_time = performance.now();
      const size_before = system.sink.triples.length;

      process_effect_definition(key, value, system);

      // Diagnostics
      const stop_time = performance.now();
      const size_after = system.sink.triples.length;
      const time = stop_time - start_time;
      const assertions = size_after - size_before;
      if (time > 100)
        console.log(`${time} ${assertions} TIME / growth`, key, value);
    }
  }
};

// behavior is undefined if source is not empty
// returns a bunch of subscriptions
const apply_drivers_to = (source, helpers, system, names) => {
  const subs = [];

  // Diagnostics
  let rule_count = 0;
  let clause_count = 0;
  for (const name of names) {
    const { rules } = driver_dictionary.get(name);
    for (const { when, disabled } of rules)
      if (!disabled) clause_count += when.length;
    rule_count += rules.length;
  }
  console.log(
    `Adding ${clause_count} clauses for ${rule_count} rules for ${names.length} drivers`
  );

  for (const name of names) {
    if (!driver_dictionary.has(name))
      throw new Error(`No such driver: ${name}`);
    const { claims, rules } = driver_dictionary.get(name);
    system.assert_all(claims);
    for (const { disabled, when, when_all, then } of rules) {
      if (disabled) continue;
      subs.push(
        live_query(source, when || when_all).subscribe({
          next: make_consequent_handler(then, helpers, system, !!when_all),
          // TODO: formally indicate source
          error: error => console.error("problem appying rule: ", when, error),
        })
      );
    }
  }
  return subs;
};

export interface MonotonicSystemOptions {
  /** Provisional.  Namespace if there were more than one. */
  readonly id?: string;

  /** Graph containing given facts. */
  readonly source: IRDFTripleSource;

  /** Where to assert to. */
  readonly sink: IRDFTripleSink;

  readonly ports?: any;

  /** Document node to be owned by the model. */
  readonly dom_root?: Node;

  /* TEMP: transitioning dom process to driver */
  readonly dom_process?: any;

  /** Optional list of driver names to install */
  readonly drivers?: readonly string[];

  /** Optional runtime object registry */
  readonly registry?: Registry;
}

/**
 * A monotonic, knowledge-based system.
 *
 * @returns (Provisional) dispose method.
 */
export const monotonic_system = (options: MonotonicSystemOptions) => {
  const { id, source, sink, dom_root, dom_process, ports, drivers } = options;
  const { registry } = options;
  const driver_names = drivers ?? [...driver_dictionary.keys()];

  const assert = fact => sink.add(fact);

  const find = subject => {
    if (!registry) throw new Error("cannot use `find`, no registry provided");
    const got = registry.find(subject);
    if (!got) console.warn(`Subject ${subject} not in registry`);
    return got;
  };

  const unstable_live_query = where => live_query(source, where);

  // The interface made available to drivers
  //
  // TEMP: Changing handlers to return side-effect descriptions.  Read-only
  // facilities will be added as needed.
  const driver_helpers = {
    find,
    unstable_live_query,
    dom_process,
  };
  const system = {
    source,
    sink, // Diagnostics
    find,
    register_input_port: (name: string, stream: IStream<any>) => {
      // DISABLED all this as OBE.
      // const impl = register_exotic(stream, rdf.namedNode("Subscribable"));
      //  This is wack.  listensTo rule doesn't fire unless the source node
      //  IMPLEMENTS the resource associated with the dataflow node.  But in
      //  this case, they are the same thing.
      // assert([impl, IMPLEMENTS, impl]);
      // assert([impl, rdf.namedNode("implementsHostInput"), rdf.literal(name)]);
    },
    register_output_port: (name, subject, source) => {
      const stream = system.find(source);
      ports?.add_output(name, stream);
    },
    assert_all: facts => sink.into(facts),
    query_all: where => sync_query(source, where),

    // A single resource can be “implemented” once for each type.  This allows
    // drivers to disambiguate the role for which they are querying
    // implementations.
    register(subject, type_name, using) {
      if (!registry)
        throw new Error("cannot use `register`, no registry provided");
      return registry.register(sink, subject, type_name, using);
    },
  };

  // Feels like this should be done in "world"
  ports?.input_added.subscribe({
    next({ name, stream }) {
      system.register_input_port(name, stream);
    },
  });

  const n = rdf.namedNode;
  if (dom_root) {
    // system.assert([n("home"), n("isa"), n("ModelDomRoot")]);
    system.register(n("home"), "Container", () => dom_root);
  }

  if (dom_process) {
    system.register(n("domProcess"), "DomProcess", () => dom_process);
  }

  const rule_subscriptions = apply_drivers_to(
    source,
    driver_helpers,
    system,
    driver_names
  );

  return function dispose() {
    for (const sub of rule_subscriptions) if (sub) sub.unsubscribe();
  };
};
