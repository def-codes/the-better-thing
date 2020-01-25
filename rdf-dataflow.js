// RDF dataflow example
const { q } = require("@def.codes/meld-core");
const { dot_notate } = require("./lib/dot-notate");
const { clusters_from } = require("./lib/clustering");

const example_triples = q("Alice loves Bob", "def:dot a def:DotInterpreter");

const dot_statements = clusters_from({
  // this describes the operation as a template
  // as distinct from an instance
  "connected component": {
    instance: dot_notate(q("instance hasInput _:input", "_:input a Graph"))
      .dot_statements,
    operation: {
      input: dot_notate(q("operation requiresInput _:input", "_:input a Graph"))
        .dot_statements,
      output: dot_notate(
        q("operation producesOutput _:output", "_:output collectionOf Graph")
      ).dot_statements,
    },
  },
  example: dot_notate(example_triples).dot_statements,
});

exports.display = {
  dot_statements,
};
