// OBE: and so is graph-templates
// see the stages in the application of rules
const tx = require("@thi.ng/transducers");
const show = require("./lib/show");
const { bind } = require("./lib/graph-templates");
const { clusters_from } = require("./lib/clustering");
const { simply_entailable_units } = require("./lib/atomize");

///////////////// DESCRIPTION OF WORK
// name: apply rule once
//
// description: (non-exhaustively?) compute the results of a production rule for
//   a given set of facts.
//
// input:
//   - S: a source RDF graph
//   - R: a production rule (antecedent: graph template, consequent, function)
//
// output: an RDF graph store containing the facts produced by rule R against S
//   (derived from input, so using same bnode space?)
//   OR is the output graph one of the inputs?
//
// invariants:
//
//   - every fact in the resulting graph can be traced to some set of facts that
//     produces it by R.
//
//   - outputs no more new bnodes than necessary
//
// intermediate results:
//   - matches: (records) results of querying antecedent of R against S

/*

  The consequent of a rule --- and any template generally --- can be broken up
  in such a way that a simple operation can tell whether or not it is entailable

  - rule breakdown (1:n consequents)
  - treat subgraph as atomic
  - grounded, no further work
  - non-grounded, test against TARGET
  - mapping means it's entailed (no-op, assert included but nothing to add)
  - no mapping means it's not entailed and every fact must be added
    - minting bnodes where appropriate

 */

//////////////////////////////////// STEP 1: apply antecedent

const { q } = require("@def.codes/meld-core");
const { sync_query, RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { DOT } = require("@def.codes/graphviz-format");

const examples = require("./lib/example-graph-pairs");
/// const { target } = examples["The author of Symposium is a student of Socrates"];
const target = q(
  "Alice loves _:b",
  "_:b loves Carol",
  "Carol loves Alice"

  // "Bob loves Alice",
  // "Alice loves Carol",
  // "Carol loves Bob",
  // "_:xyz age 31",
  // `_:xyz commonName "Fela"`
  // works but shouldn't be in graph generally
  // "?who loves me"
);

// let antecedent = q("?s ?p ?o");
let consequent = q(
  "_:trip a rdf:Statement",
  "_:trip rdf:subject ?s",
  "_:trip rdf:predicate ?p",
  "_:trip rdf:object ?o"
);
let antecedent = q("?x loves ?y", "?y loves ?z", "?z loves ?x");

const prep = (...cs) =>
  q(...cs.map(_ => _.replace(/dot:/g, DOT).replace(/ a /g, " rdf:type ")));

const DOT_SUBJECT_RULE = {
  name: "DotSubjectNodeRule",
  when: q("?s ?p ?o"),
  then: () => ({
    assert: prep(
      "_:sub a dot:Node",
      "_:sub def:represents ?s",
      "_:obj a dot:Node",
      "_:obj def:represents ?o"
      // `?sub dot:color "green"` // TEMP debug
    ),
  }),
};

const LOVE_TRIANGLE_RULE = {
  name: "LoveTriangleRule",
  when: q("?x loves ?y", "?y loves ?z", "?z loves ?x"),
  then: () => ({
    assert: prep(
      // better than `hates`
      "?x jealousOf ?z",
      "?y jealousOf ?x",
      "?z jealousOf ?y"
    ),
  }),
};

const rule = [DOT_SUBJECT_RULE, LOVE_TRIANGLE_RULE][1];
antecedent = rule.when;
consequent = rule.then().assert; // note it is nullary

// const antecedent = q("?lover loves ?lovee", "?lovee loves ?third");
// const antecedent = q("?lover loves ?lovee");
const source_store = new RDFTripleStore(target);
const matched = [...(sync_query(source_store, antecedent) || [])];
console.log(`matched`, matched);

const zipped = Array.from(matched, match => ({
  match,
  antecedent,
  consequent,
}));

const atomized = [
  ...tx.mapcat(item => {
    const { match, consequent } = item;
    const con_store = new RDFTripleStore(consequent);
    const { output: units } = simply_entailable_units(con_store);
    //return units.map(unit => ({ ...item, ...unit }));
    return units.map(_ => _.subgraph);
  }, zipped),
];
console.log(`atomized`, require("util").inspect(atomized, { depth: 5 }));

const reduced = zipped.reduce((store, { match, consequent }) => {
  store.import(bind(consequent, match));
  return store;
}, new RDFTripleStore());

const { curied_triples, curied_term } = require("./lib/curie");

const dot_statements = clusters_from({
  source: show.store(source_store),
  source_triples: show.things(source_store.triples),
  antecedent: show.triples(antecedent),
  consequent: show.triples(consequent),
  matched_data: show.thing(matched || []),
  matched: show.thing(
    matched.map(rec =>
      Object.fromEntries(
        Object.entries(rec).map(([k, v]) => [k, curied_term(v)])
      )
    )
  ),
  zipped: show.thing(zipped || []),
  reduced: show.store(reduced),
  reduced_triples: show.thing(curied_triples(reduced.triples || [])),
  reduced_triples_data: show.thing(reduced.triples || []),
  atomized: show.thing((atomized || []).map(curied_triples)),
  atomized_data: show.thing(atomized || []),
});

exports.display = { dot_statements };
