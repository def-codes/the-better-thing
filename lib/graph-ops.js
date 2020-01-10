/*
  Goal: find a mapping for bnodes in B to nodes in A.  A nodes may be reused.

  A search state is
  - A : the graph that might entail B
  - B : the graph that might be entailed
  - mappings : a partial mapping of B's bnode names to nodes in A
  - node : the blank node of B's that you're currently visiting (looking at)
  - seen : states that have been visited?  (i.e. mappings, equivmap)
  - stack : a set of nodes currently... do you need this if you already have mapping?

  Assumes that mapping is partial if you're still looking at?
  Looking at must not be in mappings.
  I don't think that looking-at is part of state

  A solution is a complete mapping, viz one with as many entries as B has bnodes.

  moves from a given mapping can be to other, more complete mappings
  - partial mappings are always valid as far as they go
  - but they might be a dead end
  - don't you need equivmap to keep from revisiting old states?
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

const is_blank_node = term => term.termType === "BlankNode";
const bnodes_in = store =>
  tx.iterator(
    tx.filter(is_blank_node),
    tx.concat(store.indexS.keys(), store.indexO.keys())
  );

// could `?` still clash with valid var name?
const make_var = (s, t) => variable(`${s}?${t}`);

function* clauses_from(key, matches) {
  for (const { match, conditions } of matches) {
    const cond = Object.entries(conditions);
    const v1 = make_var(key, match[key]);
    if (cond.length) {
      const [[k, v], ...rest] = cond;
      yield implies(
        v1,
        rest.reduce((acc, [k, v]) => and(acc, make_var(k, v)), make_var(k, v))
      );
    } else yield v1;
  }
}

// narrative description of the dictionary obtained from the queries
const describe_finding = ([label, matches]) =>
  label +
  matches
    .map(
      ({ match, conditions }) =>
        ` matches ${match[label]}\n` +
        (Object.entries(conditions).length
          ? `    if ` +
            Object.entries(conditions)
              .map(([l, n]) => `${l} maps to ${n}`)
              .join(" AND \n       ")
          : "")
    )
    .join("\n  ");

const describe_findings = findings =>
  Object.entries(findings)
    .map(describe_finding)
    .join("\n");

// All matches that are considered by anything.
// Creates a map with a set of possible targets for each bnode label
const considering = findings =>
  tx.transduce(
    tx.mapcat(([key, matches]) =>
      tx.mapcat(
        ({ match, conditions }) => [
          [key, match[key]],
          ...Object.entries(conditions),
        ],
        matches
      )
    ),
    tx.groupByMap({
      key: _ => _[0],
      group: [() => new Set(), , (acc, [, val]) => acc.add(val)],
    }),
    Object.entries(findings)
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
    yield { match: { [node.value]: ZZZ }, conditions };
}

// Tell whether `a` entails `b`, and if so include a mapping of `b`'s bnodes to
// terms in `a`.  an `a` node may be used multiple times
function simple_entailment_mapping(A, B) {
  // const queue = Array.from(bnodes_in(B), _ => ({ looking_at: _, mapping: {} }));
  // const target_size = queue.length;

  // The `mapping` is currently superseded by the SAT approach
  // but there could be specially-optimized versions that use it
  const findings = {};
  const mapping = {};
  for (const looking_at of bnodes_in(B))
    findings[looking_at.value] = [
      ...process_state({ A, B, looking_at, mapping }),
    ];

  // construct a SAT problem from the bnode findings
  // for each pairing that results indicate is possible
  // I mean... we should eliminate ones that we know are unconditionally true
  // console.log(describe_findings(findings));

  const match_clauses = [
    ...tx.flatten(
      tx.map(
        ([k, matches]) => clauses_from(k, matches),
        Object.entries(findings)
      )
    ),
  ];

  if (!match_clauses.length) {
    console.log(`no clauses!  no work`);
    return new Map();
  }

  // ensure exactly one match for each node
  const one_per_node = [
    ...tx.mapcat(
      ([label, targets]) =>
        exactly_one(Array.from(targets, target => make_var(label, target))),
      considering(findings)
    ),
  ];

  const all_clauses = [...match_clauses, ...one_per_node];

  const { variables: sat_vars, clauses: sat_clauses } = sat_prep(all_clauses);

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

module.exports = { is_blank_node, bnodes_in, simple_entailment_mapping };
