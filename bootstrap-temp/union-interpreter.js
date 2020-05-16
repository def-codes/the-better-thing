define(["@def.codes/rstream-query-rdf", "@def.codes/meld-core"], (
  rdf,
  core
) => {
  const { Dataset, UnionGraph, RDFTripleStore } = rdf;
  const { monotonic_system, q } = core;

  // Combine a union graph with some kind of function
  // Given is a graph of facts being interpreted
  const make_union_interpreter = (given, options) => {
    // the reservoir is “owned” by this thing, or can be provided from outside
    const reservoir = options.sink || new RDFTripleStore();
    const union = new UnionGraph(given, reservoir);
    const system = monotonic_system({
      source: union,
      sink: reservoir,
      ...(options || {}),
    });
    return { reservoir, union, system };
  };

  return { make_union_interpreter };
});
