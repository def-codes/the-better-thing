// RDF dataflow example
const { q } = require("@def.codes/meld-core");
const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");

const example_triples = q("Alice loves Bob", "def:dot a def:DotInterpreter");

const dot_statements = clusters_from({
  "no really": show.triples(
    q(
      "dotnodes inputs input",
      "dotedges inputs dotnodes",
      "dotnodes operation _:dotnodeop",
      "_:dotnodeop operation CONSTRUCT",
      "_:dotnodeop arg dotnoderule",
      "edgelabels inputs dotedges",
      "dotedges applies dotedgerule",
      "specialrules inputs edgelabels",
      "edgelabels applies dotedgelabelrule",
      "_selection1 ?p ?o",
      "select against input"
    )
  ),
  snap1: show.triples(
    q(
      "dotnodes inputs input",
      "dotedges inputs dotnodes",
      "dotnodes applies dotnoderule",
      "edgelabels inputs dotedges",
      "dotedges applies dotedgerule",
      "specialrules inputs edgelabels",
      "edgelabels applies dotedgelabelrule"
    )
  ),
  // "rdf dataflow": show.triples(
  //   q(
  //     "q1 a ConstructQuery",
  //     "q2 a ConstructQuery",
  //     // TripleStore is the representation, this is the model
  //     "s1 a rdf:Graph", // made this up, is it a thing?
  //     "s2 a rdf:Graph"
  //   )
  // ),
  // dataflow: show.triples(
  //   q(
  //     "_:a a OperationInstance",
  //     "_:a input b",
  //     "_:a output c",
  //     // https://xlinux.nist.gov/dads/HTML/maximallyConnectedComponent.html
  //     // or rather, this is a constraint on the output
  //     "_:a operation dads:MaximallyConnectedComponent"
  //   )
  // ),
  // this describes the operation as a template
  // as distinct from an instance
  // "connected component": {
  //   instance: show.triples(q("instance hasInput _:input", "_:input a Graph")),
  //   operation: {
  //     input: show.triples(
  //       q("operation requiresInput _:input", "_:input a Graph")
  //     ),
  //     output: show.triples(
  //       q("operation producesOutput _:output", "_:output collectionOf Graph")
  //     ),
  //   },
  // },
  // example: show.triples(example_triples),
});

exports.display = {
  dot_statements,
};
