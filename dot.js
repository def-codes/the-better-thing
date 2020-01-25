const show = require("./lib/show");
const { construct } = require("./lib/construct");
const { q } = require("@def.codes/meld-core");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { clusters_from } = require("./lib/clustering");
const { dot_interpret_rdf_store } = require("./lib/dot-interpret-rdf-store");
const Construct = require("./queries/construct-copy");
const ConstructDot = require("./queries/construct-dot");
const pairs = require("./lib/example-graph-pairs");

const MORE_TRIPLES = pairs["bnodes with disconnected components"].target;

/// Mirror: copies everything over as is
const DEFAULT_SPEC = {
  select_nodes: [Construct.Copy, ConstructDot.Node],
  select_edges: [ConstructDot.Edge],
  annotate: [ConstructDot.NodeLabel, ConstructDot.EdgeLabel],
};

const spec0 = {
  select_nodes: [{ where: q(), construct: q() }],
  select_edges: [{ where: q(), construct: q() }],
  annotate: [{ where: q(), construct: q() }],
};

function do_pipeline(triples, spec) {
  const source = new RDFTripleStore(triples);
  const first = new RDFTripleStore([], source.blank_node_space_id);
  construct(spec.select_nodes, source, first);

  const second = new RDFTripleStore(first.triples, first.blank_node_space_id);
  construct(spec.select_edges, first, second);

  const third = new RDFTripleStore(second.triples, second.blank_node_space_id);
  construct(spec.annotate, second, third);

  const interpreted = [...dot_interpret_rdf_store(third)];

  return { source, first, second, third, interpreted };
}

const input = MORE_TRIPLES;

const { interpreted: output } = do_pipeline(input, spec);

const statements = clusters_from({
  INPUT: show.triples(input),
  // rules: show.thing(spec),
  // output_1: show.things(output),
  output,
});

exports.display = {
  dot_graph: {
    directed: true,
    // attributes: { label: test_case.label, labelloc: "t", rankdir: "LR" },
    statements,
  },
};
