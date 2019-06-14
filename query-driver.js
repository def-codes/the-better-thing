(function() {
  const QUERY_DRIVER = {
    claims: q(
      // Reification vocabulary
      "Subject isa Class",
      "Property isa Class",
      "Object isa Class",
      "Triple isa Class", // ?
      "Query isa Class",
      "Clause isa Class",
      // assume conjunctive clauses
      "ConjunctiveClause isa Class",
      "Clause subclassOf Triple",
      "hasSubject isa Property",
      "hasPredicate isa Property",
      "hasObject isa Property",
      "hasSubject domain Clause",
      "hasPredicate domain Clause",
      "hasObject domain Clause",
      "hasSubject range Resource",
      "hasPredicate range Property",
      // are literals resources? need to check RDF schema
      //"hasObject range ",
      "hasClause isa Property",
      "hasClause domain Query",
      "hasClause range Clause"
    ),
    rules: [
      // 1-ary queries.  Any of the terms can be variables.
      {
        when: q(
          "?query hasClause ?clause",
          "?clause hasSubject ?subject",
          "?clause hasPredicate ?predicate",
          "?clause hasObject ?object"
        ),
        then({ query, subject, predicate, object }, system) {
          // Still not quite there.  More to the point would be to assert a
          // stream with this thunk as its source.  could *almost* be done in a
          // rule.
          system.register(
            query,
            // TODO: Query will break things when no subclass rule is in effect
            "Subscribable", //"Query", // stream?
            () => system.live_query([[subject, predicate, object]])
            //.transform(tx.trace(`DEBUG QUERY ${query}`))
          );
        }
      }
    ]
  };

  if (meld) meld.register_driver(QUERY_DRIVER);
  else console.warn("No meld system found!");
})();
