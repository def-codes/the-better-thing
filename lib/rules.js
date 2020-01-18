// THIS STUFF is all in rstream-query-rdf.  moved here to work on it
// When the asserted triples contain open variables (i.e. any variable terms),
// this treats them as a “there exists” assertion.

/*
  INTENT

  PROCEDURE

  Apply one or more rules to a (source?) graph 

  For each rule, the result is given as a set

  sequence:
    Match the antecedent against the graph
    produces a Set of results
    Set<{ record {the matched variables}, template: [the original triples/query]}>

  RECORD has bnode scope from SOURCE

  mapcat ident? (flatten)

  (opportunity here for guard condition (on item))


  map: extend with instantiate(template, record)

  HERE result now has bnodes from SOURCE AND template


- can each result be processed fully independently

- is there any difference between applying multiple rules at the same time
  versus say in succession

*/

/*
where to
- discard triples with unbound variables
- discard illegal triples (e.g. bnode in predicate position, literal in subject)
*/
const tx = require("@thi.ng/transducers");
const { inspect } = require("util");
const { instantiate } = require("./graph-templates");
// import { Term, Variable } from "@def.codes/rdf-data-model";
// import { TripleStore } from "@thi.ng/rstream-query";
// import { PseudoTriple, PseudoTriples, PseudoRule } from "./api";

const { sync_query, RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { compare_graphs_simple } = require("./compare-graphs");

// compute the results (assertions) of the given rule on the given store
// assumes all rule conclusions use assert
// const interpret_rule = (store: RDFTripleStore) => ({ when, then }) =>
// const interpret_rule = store => ({ when, then }) =>
//   tx.map(_ => construct(then(_).assert, _), sync_query(store, when) || []);
const interpret_rule = store => ({ when, then }) =>
  tx.map(_ => instantiate(then(_).assert, _), sync_query(store, when) || []);

// compute the results (assertions) of the given rules on the given store
// export const interpret_rules = (
//   store: RDFTripleStore,
//   rules: readonly PseudoRule[]
// ) => transduce(mapcat(interpret_rule(store)), conj(), rules);

// const interpret_rules = (store, rules) =>
//   new Set(mapcat(interpret_rule(store), rules));

const interpret_rules = (store, rules) => {
  const running = new RDFTripleStore();
  const interpret = interpret_rule(store);
  for (const rule of rules) {
    for (const new_facts of interpret(rule)) {
      const foo = compare_graphs_simple(running, new RDFTripleStore(new_facts));
      // if (rule.name === "DotEdgeRule")
      //   console.log(`foo`, inspect(foo, { depth: 6 }));
      running.into(foo.incoming);
    }
  }

  return running.triples;
};

module.exports = { interpret_rules };
