/*

Marking is the extension of an existing notation.

Notation: talking about how things are represented (in dot)

You can't mark without a selection.

And structurally, marks are just another graph.  They function as marks only
because you merge it into a graph that already had those elements.

*/
const tx = require("@thi.ng/transducers");
const dot = require("@def.codes/graphviz-format");

// against a traversal, emit dot statements with given (fixed) attributes
// this isn't necessarily about "marking" edges, though;
// it will emit them if they did not exist
// the presumption is that the facts have already gone to the graph
exports.mark_edges = (facts, attributes) =>
  dot.statements_from_traversal(facts, { describe_edge: () => attributes });

// for a given set of id's, emit dot statements with the given (fixed) attributes
exports.mark_nodes_by_id = (ids, attributes) =>
  tx.map(id => ({ type: "node", id, attributes }), ids);
