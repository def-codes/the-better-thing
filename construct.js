// see the stages in the application of rules
// this is just a CONSTRUCT query
const tx = require("@thi.ng/transducers");
const show = require("./lib/thing-to-dot-statements");
const { construct } = require("./lib/construct");
const { dot_notate } = require("./lib/dot-notate");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { DOT } = require("@def.codes/graphviz-format");

const examples = require("./lib/example-graph-pairs");
/// const { target } = examples["The author of Symposium is a student of Socrates"];
const source = q(
  "Alice loves _:b",
  "_:b loves Carol",
  "Carol loves Alice",
  "Dave loves Carol"
);

const prep = (...cs) =>
  q(...cs.map(_ => _.replace(/dot:/g, DOT).replace(/ a /g, " rdf:type ")));

const COPY_RULE = {
  name: "CopyRule",
  where: q("?s ?p ?o"),
  construct: q("?s ?p ?o"),
};

const DOT_NODE_RULE = {
  name: "DotNodeRule",
  where: q("?s ?p ?o"),
  construct: prep(
    "_:sub a dot:Node",
    "_:sub def:represents ?s",
    "_:obj a dot:Node",
    "_:obj def:represents ?o"
  ),
};

const DOT_SUBJECT_RULE = {
  name: "DotSubjectNodeRule",
  where: q("?s ?p ?o"),
  construct: prep("_:sub a dot:Node", "_:sub def:represents ?s"),
};

const DOT_OBJECT_RULE = {
  name: "DotObjectNodeRule",
  where: q("?s ?p ?o"),
  construct: prep("_:obj a dot:Node", "_:obj def:represents ?o"),
};

const DOT_EDGE_RULE = {
  name: "DotEdgeRule",
  where: prep(
    "?subject ?predicate ?object",
    "?from a dot:Node",
    "?from def:represents ?subject",
    "?to a dot:Node",
    "?to def:represents ?object"
  ),
  construct: prep(
    "_:edge a dot:Edge",
    "_:edge dot:from ?from",
    "_:edge dot:to ?to",
    "_:edge def:represents _:trip",
    "_:trip rdf:subject ?subject",
    "_:trip rdf:predicate ?predicate",
    "_:trip rdf:object ?object"
  ),
};

const DOT_LABEL_RULE_0 = {
  name: "DotLabelRule",
  where: prep("?n a dot:Node"),
  construct: prep(`?n dot:color "red"`, `?n dot:style "filled"`),
};

const DOT_LABEL_RULE = {
  name: "DotLabelRule",
  where: prep("?n a dot:Node", "?n def:represents ?s"),
  // this kinda works but not for good reason
  construct: prep(`?n dot:label ?s`),
};

const LOVE_TRIANGLE_RULE = {
  name: "LoveTriangleRule",
  where: q("?x loves ?y", "?y loves ?z", "?z loves ?x"),
  construct: prep(
    // better than `hates`
    "?x jealousOf ?z",
    "?y jealousOf ?x",
    "?z jealousOf ?y",
    "_:someone pities ?x"
  ),
};

const rule = [DOT_SUBJECT_RULE, LOVE_TRIANGLE_RULE][0];
// COPY_RULE seems not to be working
const rules = [
  // COPY_RULE,
  DOT_NODE_RULE,
  // DOT_SUBJECT_RULE,
  // DOT_OBJECT_RULE,
  // DOT_EDGE_RULE,
  // DOT_LABEL_RULE,
];

const source_store = new RDFTripleStore(source);
// For derived graph
const target_store = new RDFTripleStore(
  source_store.triples,
  source_store.blank_node_space_id
);
// For new graph
// const target_store = new RDFTripleStore();
construct(rules, source_store, target_store);
// console.log(`target_store.triples`, target_store.triples);

const second_target_store = new RDFTripleStore(
  target_store.triples,
  target_store.blank_node_space_id
);
construct([DOT_LABEL_RULE, DOT_EDGE_RULE], target_store, second_target_store);

const { curied_triples, curied_term } = require("./lib/curie");

const { dot_interpret_rdf_store } = require("./lib/dot-interpret-rdf-store");
const interpreted = [...dot_interpret_rdf_store(second_target_store)];

const dot_statements = clusters_from({
  source: dot_notate(source_store.triples).dot_statements,
  source_triples: show.things(source_store.triples).dot_statements,
  // where: dot_notate(where).dot_statements,
  // construct: dot_notate(construct).dot_statements,
  target: dot_notate(target_store.triples).dot_statements,
  target_triples: show.things(target_store.triples).dot_statements,
  second_target: dot_notate(second_target_store.triples).dot_statements,
  second_target_triples: show.things(second_target_store.triples)
    .dot_statements,
  interpreted,
});

exports.display = { dot_statements };
