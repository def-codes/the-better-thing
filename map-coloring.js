// map coloring
const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { Dataset, factory } = require("@def.codes/rstream-query-rdf");
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

  // The variables are part of a problem.  Associate variables with problem.
  problem_store.into(variables.map(([s]) => [problem, HAS_VARIABLE, s]));

  // ==== MAP VIEW

  // Could we make the map view from the variables (problem statement)?
  // this assumes a lot and would get to be domain-specific
  // also, would let you state contents positively (vs filtering)

  const map_view = dataset.create();
  // Just use the ID's for labels.  type is not needed for display
  map_view.into(
    usa_states_triples.filter(_ => _[1] !== LABEL && _[1] !== TYPE)
  );

  // ==== OVERVIEW ==== //

  // newer rules-based display is currently way too slow for this purpose
  const statements = clusters_from({
    problem: show.store_old(problem_store),
    map_view: show
      // edge_label override is for new show.store method, which is currently not used
      .store_old(map_view, { edge_label: [] }) //  edges are all “us:borders”
      .map(unlabel_edge),
  });

  const dot_graph = {
    type: "graph",
    strict: true,
    node_attributes: { shape: "circle" },
    // fdp preserves cluster boundaries & their labels
    // neato produces something almost completely flat & resembling US
    attributes: { layout: "neato" },
    statements,
  };

  return { dot_graph };
};

exports.display = main();
