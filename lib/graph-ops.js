/*
  Goal: find a mapping for bnodes in B to nodes in A.  A nodes may be reused.

  A search state is
  - A : the graph that might entail B
  - B : the graph that might be entailed
  - mappings : a partial mapping of B's bnode names to nodes in A

  A solution is a complete mapping, viz one with as many entries as B has bnodes.
*/
const tx = require("@thi.ng/transducers");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { sync_query } = require("@def.codes/rstream-query-rdf");
const {
  constructors,
  ascii_notate: notate,
  sat_prep,
  exactly_one,
} = require("./simple-logic");
const { solve } = require("./naive-sat");

const { namedNode: n, blankNode: b, literal: l, variable: v } = factory;
const { or, and, implies, not, variable } = constructors;

const is_named_node = term => term.termType === "NamedNode";
const is_blank_node = term => term.termType === "BlankNode";
const is_literal = term => term.termType === "Literal";

const is_ground_term = term => is_named_node(term) || is_literal(term);
const is_ground_triple = triple => triple.every(is_ground_term);

const terms_in = store =>
  tx.concat(store.indexS.keys(), store.indexP.keys(), store.indexO.keys());

const bnodes_in = store =>
  tx.iterator(
    tx.filter(is_blank_node),
    tx.concat(store.indexS.keys(), store.indexO.keys())
  );

const literals_in = store =>
  tx.iterator(tx.filter(is_literal), store.indexO.keys());

// could `?` still clash with valid var name?
const make_var = (s, t) => variable(`${s}?${t}`);

// if a node can match a candidate unconditionally, any other condition sets
// don't matter.  in practice, this wouldn't happen as long as the # of vars is
// same for all queries
const is_unconditional = list =>
  list.length === 0 ||
  list.some(conditions => Object.keys(conditions).length === 0);

// For each node, emit one ‘implies’ clause for each of its contingent
// candidates.  Emit nothing for unconditional matches.  Unconditional mappings
// are covered by exactly-one.
//
// a node can match the same target in multiple ways
const condition_clauses = findings =>
  tx.mapcat(
    ([key, map]) =>
      tx.map(
        ([candidate, condition_sets]) =>
          implies(
            make_var(key, candidate),
            condition_sets
              .map(conditions =>
                Object.entries(conditions)
                  .map(([k, v]) => make_var(k, v))
                  .reduce(and)
              )
              .reduce(or)
          ),
        tx.filter(([, cs]) => !is_unconditional(cs), map)
      ),
    Object.entries(findings)
  );

// narrative description of the dictionary obtained from the queries
const describe_finding = ([label, map]) =>
  label +
  Array.from(
    map,
    ([candidate, condition_sets]) =>
      ` is ${candidate}\n` +
      condition_sets
        .map(conditions =>
          Object.entries(conditions).length
            ? `    if ` +
              Object.entries(conditions)
                .map(([l, n]) => `${l} is ${n}`)
                .join(" AND \n       ")
            : ""
        )
        .join("\n   OR \n")
  ).join("\n ");

const describe_findings = findings =>
  Object.entries(findings)
    .map(describe_finding)
    .join("\n");

// opaque, imperative, readable version of below
/*
function* all_mappings_in_0(findings) {
  for (const [label, map] of Object.entries(findings))
    for (const [candidate, condition_set] of map) {
      yield [label, candidate];
      for (const conditions of condition_set) yield* Object.entries(conditions);
    }
}
*/

const all_mappings_in = findings =>
  tx.mapcat(
    ([label, map]) =>
      tx.mapcat(
        ([candidate, condition_set]) =>
          tx.concat(
            [[label, candidate]],
            tx.mapcat(Object.entries, condition_set)
          ),
        map
      ),
    Object.entries(findings)
  );

// All matches that are considered by anything.
// Creates a map with a set of possible targets for each bnode label
const considering = findings =>
  tx.reduce(
    tx.groupByMap({
      key: _ => _[0],
      group: [() => new Set(), , (acc, [, val]) => acc.add(val)],
    }),
    all_mappings_in(findings)
  );

// given a state, produce possible moves
// no moves means dead end
// yields once for each possible match/scenario for given node
function* process_state({ A, B, mapping, looking_at: node }) {
  // construct a query for A
  const clauses = (idx, f) => tx.map(i => f(B.triples[i]), idx.get(node) || []);
  const sub = n => (is_blank_node(n) ? mapping[n.value] || v(n.value) : n);
  const query = [
    ...clauses(B.indexS, ([, p, o]) => [v("ZZZ"), p, sub(o)]),
    ...clauses(B.indexO, ([s, p]) => [sub(s), p, v("ZZZ")]),
  ];

  // others are conditional because you still have to look at them
  for (const { ZZZ, ...conditions } of sync_query(A, query) || [])
    yield { node: node.value, candidate: ZZZ, conditions };
}

// Return a mapping of `b`'s bnodes to terms in `a`, if all of them are properly
// entailed.  An `a` node may be used multiple times.
function simple_entailment_mapping(A, B) {
  // The `mapping` is currently superseded by the SAT approach
  // but there could be specially-optimized versions that use it
  const findings = {};
  const mapping = {};

  for (const looking_at of bnodes_in(B)) {
    findings[looking_at.value] = tx.reduce(
      tx.groupByMap({
        key: _ => _.candidate,
        group: [() => [], , (acc, val) => (acc.push(val.conditions), acc)],
      }),
      process_state({ A, B, looking_at, mapping })
    );
  }

  // construct a SAT problem from the bnode findings
  // for each pairing that results indicate is possible
  // I mean... we should eliminate ones that we know are unconditionally true
  // console.log(describe_findings(findings));

  const conditional_clauses = [...condition_clauses(findings)];
  // console.log(`conditional_clauses`, conditional_clauses.map(notate));

  // ensure exactly one match for each node
  const one_per_node = [
    ...tx.mapcat(
      ([label, targets]) =>
        exactly_one(Array.from(targets, target => make_var(label, target))),
      considering(findings)
    ),
  ];

  const all_things_considered = [
    ...tx.mapcat(
      ([label, targets]) => tx.map(target => [label, target], targets),
      considering(findings)
    ),
  ];

  if (!all_things_considered.length) {
    // console.log(`No findings!`);
    return new Map();
  }

  // Tell the model which mappings are known to be impossible because they
  // didn't match the target.  Some such pairings arise in the form of
  // conditions stated on other nodes.  We can't eliminate them during the
  // collection because it requires all findings to be in.  Instead we're just
  // asserting to the SAT model that such mappings are known to be false.  It
  // would perhaps be more efficient to eliminate them in a follow-up pass,
  // since this would mean the removal of variables versus the addition of
  // clauses.  But this was a simpler way to get the correct behavior.
  const is_viable = (label, target, findings) =>
    findings[label] && findings[label].has(target);
  const non_viable = tx.map(
    ([f, t]) => not(make_var(f, t)),
    tx.filter(
      ([label, target]) => !is_viable(label, target, findings),
      all_things_considered
    )
  );
  // console.log(`one_per_node.map(notate)`, one_per_node.map(notate));

  const all_clauses = [...conditional_clauses, ...one_per_node, ...non_viable];
  // console.log(`all clauses`, all_clauses.map(notate));

  const { variables: sat_vars, clauses: sat_clauses } = sat_prep(all_clauses);
  // for (const c of sat_clauses)
  //   console.log(c.map(_ => `${_.neg ? "~" : ""}${_.variable}`).join(" | "));
  // console.log(`sat_clauses`, sat_clauses.map(notate));

  const model = solve(sat_vars, sat_clauses);

  // Now read back into a mapping
  // model uses this weird prototype thing
  const result = new Map();
  for (const key in model)
    if (model[key]) {
      const [from, to] = key.split("?");
      result.set(b(from), factory.from_id(to));
    }
  return result;
}

module.exports = {
  is_blank_node,
  is_ground_triple,
  bnodes_in,
  literals_in,
  terms_in,
  simple_entailment_mapping,
  describe_findings,
};
