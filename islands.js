const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { islands_from } = require("./lib/islands");

const TEST_CASES = [
  {
    source: q("a b _:c"),
    predicate: _ => _.termType === "BlankNode",
  },
  {
    source: q("_:A b C", "_:D e _:F", "_:G h I", "C z _:D", "_:G z C"),
    predicate: _ => _.termType === "BlankNode",
  },
];

const main = test_case => {
  const { source, predicate } = test_case;

  const islands_result = islands_from(source, predicate);
  const islands_case = { source, islands_result };

  const {
    intermediate: { graph, subgraph, components },
    output: islands,
  } = islands_result;

  const dot_statements = clusters_from({
    source: show.triples(source),
    source_triples: show.thing(source),
    graph: show.graph(graph),
    subgraph: show.graph(subgraph),
    components: show.thing(components),
    islands_triples: show.things(islands),
    islands: Object.fromEntries(
      Object.entries(islands).map(([key, trips]) => [key, show.triples(trips)])
    ),
  });

  return {
    dot_graph: {
      directed: true,
      attributes: { rankdir: "LR" },
      statements: dot_statements,
    },
  };
};

exports.display = main(TEST_CASES[1]);
