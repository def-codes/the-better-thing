// map coloring
const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { Dataset, factory } = require("@def.codes/rstream-query-rdf");
const tx = require("@thi.ng/transducers");
const { naive_dfs_recursive } = require("./lib/constraint-satisfaction");
const { ops } = require("./lib/persistent-dictionary");
const { usa_states_triples } = require("./graphs/usa-states-triples");

const { namedNode: n } = factory;

const TYPE = n("rdf:type");
const LABEL = n("rdf:label");

// Domain
const US_STATE = n("us:State");

// PSM
// PREFIX csp: Constraint Satisfaction Problem
// more generally, a variable in a logic problem
const VARIABLE = n("csp:Variable");
const PROBLEM = n("csp:Problem");
// domain csp:Problem range csp:Variable
const HAS_VARIABLE = n("csp:hasVariable");

// Helper function for below
const unlabel_edge = ({ attributes, ...rest }) => ({
  ...rest,
  attributes: Object.fromEntries(
    Object.entries(attributes || {}).filter(
      ([key]) => !(rest.type === "edge" && key === "label")
    )
  ),
});

const main = () => {
  const dataset = new Dataset();

  // ==== DOMAIN
  const domain_store = dataset.create();
  domain_store.into(usa_states_triples);

  // ==== PROBLEM
  //
  // Adapt domain to problem-solving-method ontology

  const problem_store = dataset.create();
  // problem_store.into(usa_states_triples);

  // A problem instance
  const problem = n("problem1");
  problem_store.add([problem, TYPE, PROBLEM]);

  // Create a variable for each state
  const variables = usa_states_triples
    .filter(([, p, o]) => p === TYPE && o === US_STATE)
    .map(([s]) => [s, TYPE, VARIABLE]);
  problem_store.into(variables);

  // The variables are part of a problem.  Associate variables with problem.
  problem_store.into(variables.map(([s]) => [problem, HAS_VARIABLE, s]));

  // DOMAINS
  //
  // All states have the same domain
  // Do we need to repeat the whole set for each one?

  // ==== MAP VIEW

  // Could we make the map view from the variables (problem statement)?
  // this assumes a lot and would get to be domain-specific
  // also, would let you state contents positively (vs filtering)

  const map_view = dataset.create();
  // Just use the ID's for labels.  type is not needed for display
  map_view.into(
    usa_states_triples.filter(_ => _[1] !== LABEL && _[1] !== TYPE)
  );

  // ==== SEARCH SPACE
  const triples = q("a p b", "b p c", "c p a", "c p d", "d p e");
  const triples_statements = show.triples_old(triples).map(unlabel_edge);

  const colors = new Set("red darkgreen blue purple".split(" "));
  const problem_0 = {
    variables: new Map("a b c d".split(" ").map(v => [v, colors])),
    constraints: [{}],
  };

  const assignments_raw = Array.from(
    naive_dfs_recursive(problem_0),
    _ => _.assignment
  );
  const assignments = assignments_raw.map(ops.objectify);
  // const assignments = [{}, { a: "red" }]; etc

  const connect = assignments_raw
    .map((ass, index) => [assignments_raw.indexOf(ops.parent(ass)), index])
    .filter(([a, b]) => a > -1);

  const color_with = (assignment, statements = triples_statements) =>
    Object.entries(assignment).map(([id, color]) => ({
      type: "node",
      id,
      attributes: { style: "filled", color },
    }));

  return {
    delay: 250,
    sequence: tx.map(n => {
      const assignment = assignments[n];
      const search_space = [...triples_statements, ...color_with(assignment)];
      // ==== OVERVIEW ==== //

      // newer rules-based display is currently way too slow for this purpose
      const statements = [
        ...clusters_from({
          // problem: show.store_old(problem_store),
          search_space,
        }),
      ];

      const dot_graph = {
        type: "graph",
        strict: true,
        node_attributes: { shape: "circle" },
        graph_attributes: { bgcolor: "transparent" },
        attributes: { layout: "fdp" },
        statements,
      };

      return { dot_graph };
    }, tx.range(1, Infinity)),
  };
};

exports.display = main();
