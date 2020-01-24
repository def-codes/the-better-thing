const { DOT } = require("@def.codes/graphviz-format");
const { q } = require("@def.codes/meld-core");

const prep = (...cs) =>
  q(...cs.map(_ => _.replace(/dot:/g, DOT).replace(/ a /g, " rdf:type ")));

exports.Node = {
  comment: "Create a Dot node for each node in the input and link to it",
  where: q("?s ?p ?o"),
  construct: prep(
    "_:sub a dot:Node",
    "_:sub def:represents ?s",
    "_:obj a dot:Node",
    "_:obj def:represents ?o"
  ),
};

exports.Edge = {
  comment: "Create a Dot edge for eact triple in the input and link to it",
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

// These label rules work but should really be coercing label value to literal.
exports.NodeLabel = {
  where: prep("?n a dot:Node", "?n def:represents ?s"),
  construct: prep(`?n dot:label ?s`),
};

exports.EdgeLabel = {
  where: prep(
    "?edge def:represents ?statement",
    "?statement rdf:predicate ?predicate"
  ),
  construct: prep(`?edge dot:label ?predicate`),
};
