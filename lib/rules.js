// THIS STUFF is all in rstream-query-rdf.  moved here to work on it
// When the asserted triples contain open variables (i.e. any variable terms),
// this treats them as a “there exists” assertion.
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
const { merge_graphs_simple } = require("./simple-merge");

// compute the results (assertions) of the given rule on the given store
// assumes all rule conclusions use assert
// const interpret_rule = (store: RDFTripleStore) => ({ when, then }) =>
// const interpret_rule = store => ({ when, then }) =>
//   tx.map(_ => construct(then(_).assert, _), sync_query(store, when) || []);
const interpret_rule = store => ({ when, then }) => {
  return tx.map(_ => {
    if (_.subject) console.log(`RESULT`, _);

    return instantiate(then(_).assert, _);
  }, sync_query(store, when) || []);
};

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
      const foo = merge_graphs_simple(running, new RDFTripleStore(new_facts));
      // if (rule.name === "DotEdgeRule")
      //   console.log(`foo`, inspect(foo, { depth: 6 }));
      running.into(foo.incoming);
    }
  }

  return running.triples;
};

module.exports = { interpret_rules };
