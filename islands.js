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
  //  { matching_triples, components, islands }
  const islands_result = islands_from(source, predicate);
  return { source, islands_result };
};

const islands_case = [
  {
    source: q("_:A b C", "_:D e _:F", "_:G h I", "C z _:D", "_:G z C"),
    predicate: _ => _.termType === "BlankNode",
  },
][0];

const { source, islands_result } = do_islands_case(islands_case);

const dot_statements = clusters_from({
  source: dot_notate(source).dot_statements,
  // source_triples: show.thing(source).dot_statements,
  islands_result: show.things(islands_result.islands).dot_statements,
}).map(_ => ({ ..._, attributes: { label: _.id.slice("cluster ".length) } }));

exports.display = {
  dot_graph: {
    directed: true,
    attributes: { rankdir: "LR" },
    statements: dot_statements,
  },
};
