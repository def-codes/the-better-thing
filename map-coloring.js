// map coloring
const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { Dataset, factory } = require("@def.codes/rstream-query-rdf");
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

  // State variables
  //
  // - Use rules where possible when input already uses RDF terms
  //   - using selections, e.g. ?x a us:State -> ?x a csp:Variable
  // - else use bespoke code when input is JS (preferably by way of JSON-LD)

  // TODO: Use rule pipeline

  // Create a variable for each state
  const variables = usa_states_triples
    .filter(([, p, o]) => p === TYPE && o === US_STATE)
    .map(([s]) => [s, TYPE, VARIABLE]);
  problem_store.into(variables);

  // Is there a definition of the domain for each variable that is distinct from
  // its domain at any given point in the search? i.e. when you proceed by
  // domain reduction, is there not some definition of the domain that precedes
  // the work and stands as part of the definition?

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
  const triples = q("a p b", "b p c", "c p a", "c p d");
  const triples_statements = show.triples_old(triples).map(unlabel_edge);

  const colors = new Set("red darkgreen blue purple".split(" "));
  const problem_0 = {
    variables: new Map("a b c".split(" ").map(v => [v, colors])),
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
      id: id,
      attributes: { style: "filled", color, fontcolor: "white" },
    }));
  const search_space = Object.fromEntries(
    assignments.map((assignment, index) => [
      index,
      Object.assign(
        [
          { type: "node", id: "_", attributes: { style: "invis" } },
          ...triples_statements,
          ...color_with(assignment),
        ],
        {
          attributes: {
            label: Object.entries(assignment)
              .map(([k, v]) => `${k}:${v}`)
              .join(","),
          },
        }
      ),
    ])
  );

  // ==== OVERVIEW ==== //

  // wonky but the only way I could get arrows between the clusters
  const [first] = problem_0.variables.keys();
  const connections = connect.map(([from, to]) => ({
    type: "edge",
    // Instead of pointing to the dummy `_` element, point to a real one.
    // This makes inter-cluster arrows work a little in sfdp
    from: `search_space/${from}/${first}`,
    to: `search_space/${to}/${first}`,
    attributes: {
      dir: "forward",
      // Only works in `dot` engine, but dot is otherwise bad
      ltail: `cluster search_space/${from}`,
      lhead: `cluster search_space/${to}`,
    },
  }));

  // newer rules-based display is currently way too slow for this purpose
  const statements_0 = [
    ...connections,
    ...clusters_from({
      // problem: show.store_old(problem_store),
      search_space,
      // map_view: show
      //   // edge_label override is for new show.store method, which is currently not used
      //   .store_old(map_view, { edge_label: [] }) //  edges are all “us:borders”
      //   .map(unlabel_edge),
    }),
  ];
  // console.log(`statements`, require("util").inspect(statements, { depth: 6 }));
  const N = 5;
  const assignment = assignments[N];
  const statements = [...triples_statements, ...color_with(assignment)];

  const dot_graph = {
    type: "graph",
    strict: true,
    node_attributes: { shape: "circle" },
    // edge_attributes: { len: 0.05 },
    // edge_attributes: { len: 5 },

    // fdp preserves cluster boundaries & their labels
    // neato is really good for map; with short edge length, fdp is almost as good
    // only dot handles inter-cluster links reasonably
    attributes: {
      // sep: "+77",               // use with sfdp when viewing multiple clusters
      rankdir: "LR",
      compound: true,
      layout: "fdp",
      // mode: "maxent", // Appears to have no effect at all
    },
    statements,
  };

  return { dot_graph };
};

exports.display = main();
