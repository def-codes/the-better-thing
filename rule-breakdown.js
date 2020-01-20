// see the stages in the application of rules
const tx = require("@thi.ng/transducers");
const show = require("./lib/thing-to-dot-statements");
const { bind } = require("./lib/graph-templates");
const { dot_notate } = require("./lib/dot-notate");
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

//////////////////////////////////// STEP 1: apply antecedent

const { q } = require("@def.codes/meld-core");
const { sync_query, RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { DOT } = require("@def.codes/graphviz-format");

const examples = require("./lib/example-graph-pairs");
/// const { target } = examples["The author of Symposium is a student of Socrates"];
const target = q(
  "Bob loves Alice",
  "Alice loves Carol",
  "Carol loves Bob",
  "_:xyz age 31",
  `_:xyz commonName "Fela"`
  // works but shouldn't be in graph generally
  // "?who loves me"
);

let antecedent = q("?s ?p ?o");
let consequent = q(
  "_:trip a rdf:Statement",
  "_:trip rdf:subject ?s",
  "_:trip rdf:predicate ?p",
  "_:trip rdf:object ?o"
);

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

antecedent = DOT_SUBJECT_RULE.when;
consequent = DOT_SUBJECT_RULE.then().assert; // note it is nullary

// const antecedent = q("?lover loves ?lovee", "?lovee loves ?third");
// const antecedent = q("?lover loves ?lovee");
const source_store = new RDFTripleStore(target);
const matched = sync_query(source_store, antecedent);
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
    const { units } = simply_entailable_units(con_store);
    //return units.map(unit => ({ ...item, ...unit }));
    return units.map(_ => _.subgraph);
  }, zipped),
];
console.log(`atomized`, require("util").inspect(atomized, { depth: 5 }));

const reduced = zipped.reduce((store, { match, consequent }) => {
  store.import(bind(consequent, match));
  return store;
}, new RDFTripleStore());

const { curied_triples } = require("./curie");

const dot_statements = clusters_from({
  source: dot_notate(source_store.triples).dot_statements,
  source_triples: show.things(source_store.triples).dot_statements,
  antecedent: dot_notate(antecedent).dot_statements,
  consequent: dot_notate(consequent).dot_statements,
  matched: show.thing(matched || []).dot_statements,
  zipped: show.thing(zipped || []).dot_statements,
  reduced: dot_notate(reduced.triples).dot_statements,
  reduced_triples: show.thing(curied_triples(reduced.triples || []))
    .dot_statements,
  reduced_triples_data: show.thing(reduced.triples || []).dot_statements,
  atomized: show.thing((atomized || []).map(curied_triples)).dot_statements,
  atomized_data: show.thing(atomized || []).dot_statements,
}).map(_ => ({ ..._, attributes: { label: _.id.slice("cluster ".length) } }));

exports.display = { dot_statements };
