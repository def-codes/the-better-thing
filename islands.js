const { inspect } = require("util");
const tx = require("@thi.ng/transducers");
const show = require("./lib/thing-to-dot-statements");
// const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { q } = require("@def.codes/meld-core");
const { dot_notate } = require("./lib/dot-notate");
const { islands_from } = require("./lib/islands");
const { clusters_from } = require("./lib/clustering");
// const { color_connected_components } = require("./lib/color-connected");

const do_islands_case = ({ source, predicate }) => {
  const islands_result = islands_from(source, predicate);
  return { source, islands_result };
};

const islands_cases = [
  {
    source: q("a b _:c"),
    predicate: _ => _.termType === "BlankNode",
  },
  {
    source: q("_:A b C", "_:D e _:F", "_:G h I", "C z _:D", "_:G z C"),
    predicate: _ => _.termType === "BlankNode",
  },
];

const islands_case = islands_cases[1];

const { source, islands_result } = do_islands_case(islands_case);
const { graph, subgraph, components, islands } = islands_result;

const dot_statements = clusters_from({
  source: dot_notate(source).dot_statements,
  source_triples: show.thing(source).dot_statements,
  graph: show.graph(graph).dot_statements,
  subgraph: show.graph(subgraph).dot_statements,
  components: show.thing(components).dot_statements,
  islands_triples: show.things(islands).dot_statements,
  islands: Object.fromEntries(
    Object.entries(islands).map(([key, trips]) => [
      key,
      dot_notate(trips).dot_statements,
    ])
  ),
});

exports.display = {
  dot_graph: {
    directed: true,
    attributes: { rankdir: "LR" },
    statements: dot_statements,
  },
};
