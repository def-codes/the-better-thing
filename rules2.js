// see the stages in the application of rules
const tx = require("@thi.ng/transducers");
const show = require("./lib/thing-to-dot-statements");
const { apply_rules } = require("./lib/rules2");
const { dot_notate } = require("./lib/dot-notate");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { DOT } = require("@def.codes/graphviz-format");

const examples = require("./lib/example-graph-pairs");
/// const { target } = examples["The author of Symposium is a student of Socrates"];
const source = q("Alice loves _:b", "_:b loves Carol", "Carol loves Alice");

const prep = (...cs) =>
  q(...cs.map(_ => _.replace(/dot:/g, DOT).replace(/ a /g, " rdf:type ")));

const DOT_SUBJECT_RULE = {
  name: "DotSubjectNodeRule",
  antecedent: q("?s ?p ?o"),
  consequent: prep("_:sub a dot:Node", "_:sub def:represents ?s"),
};

const DOT_OBJECT_RULE = {
  name: "DotObjectNodeRule",
  antecedent: q("?s ?p ?o"),
  consequent: prep("_:obj a dot:Node", "_:obj def:represents ?o"),
};

const LOVE_TRIANGLE_RULE = {
  name: "LoveTriangleRule",
  antecedent: q("?x loves ?y", "?y loves ?z", "?z loves ?x"),
  consequent: prep(
    // better than `hates`
    "?x jealousOf ?z",
    "?y jealousOf ?x",
    "?z jealousOf ?y",
    "_:someone pities ?x"
  ),
};

const rule = [DOT_SUBJECT_RULE, LOVE_TRIANGLE_RULE][0];
const rules = [DOT_SUBJECT_RULE, DOT_OBJECT_RULE];

const source_store = new RDFTripleStore(source);
// For derived graph
const target_store = new RDFTripleStore([], source_store.blank_node_space_id);
// For new graph
// const target_store = new RDFTripleStore();
apply_rules(rules, source_store, target_store);
console.log(`target_store.triples`, target_store.triples);

const { curied_triples, curied_term } = require("./curie");

const dot_statements = clusters_from({
  source: dot_notate(source_store.triples).dot_statements,
  source_triples: show.things(source_store.triples).dot_statements,
  // antecedent: dot_notate(antecedent).dot_statements,
  // consequent: dot_notate(consequent).dot_statements,
  target: dot_notate(target_store.triples).dot_statements,
  target_triples: show.things(target_store.triples).dot_statements,
}).map(_ => ({ ..._, attributes: { label: _.id.slice("cluster ".length) } }));

exports.display = { dot_statements };
