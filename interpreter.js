var meld_interpreter = (function() {
  const { transducers: tx } = thi.ng;
  const { rdf, turtle_term_interpreter } = window;
  const { as_turtle } = turtle_term_interpreter;

  // We're not actually changing to RDF triples as such...
  // just using RDF terms with rstream-query-style tuples
  const trip = (s, p, o) => [
    typeof s === "string" ? rdf.namedNode(s) : s,
    typeof p === "string" ? rdf.namedNode(p) : p,
    !o || !o.termType ? rdf.literal(o) : o
  ];

  // ================================= WORLD / INTERPRETER

  const interpret = statements => {
    // Would be mapcat assuming
    return tx.transduce(
      tx.comp(tx.map(as_turtle), tx.keep()),
      tx.push(),
      statements
    );
  };

  return { interpret };
})();
