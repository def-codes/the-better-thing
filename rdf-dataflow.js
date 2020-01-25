// RDF dataflow example
const { q } = require("@def.codes/meld-core");
const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");

const example_triples = q("Alice loves Bob", "def:dot a def:DotInterpreter");

const dot_statements = clusters_from({
  // this describes the operation as a template
  // as distinct from an instance
  "connected component": {
    instance: show.triples(q("instance hasInput _:input", "_:input a Graph")),
    operation: {
      input: show.triples(
        q("operation requiresInput _:input", "_:input a Graph")
      ),
      output: show.triples(
        q("operation producesOutput _:output", "_:output collectionOf Graph")
      ),
    },
  },
  example: show.triples(example_triples),
});

exports.display = {
  dot_statements,
};
