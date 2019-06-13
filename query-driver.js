(function() {
  const QUERY_DRIVER = {
    claims: q(
      // Reification vocabulary
      "Subject isa Class",
      "Property isa Class",
      "Object isa Class",
      "Triple isa Class", // ?
      "Query isa Class",
      // assume conjunctive clauses
      "Clause isa Class",
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
      // 1-ary queries
      {
        when: q(
          "?query hasClause ?clause",
          "?clause hasSubject ?subject",
          "?clause hasPredicate ?predicate",
          "?clause hasObject ?object"
        ),
        then({ query, subject, predicate, object }, system) {
          system.register(query, () => {
            // note  it should be possible for any of these to be variables.
            //
            console.log(
              `query, subject, predicate, object`,
              query,
              subject,
              predicate,
              object
            );
            //return null;
            // but wait... it's a stream source.  so you actually want to provide this as a thunk.
            // ideally you would just state the existence of the stream resource, right?
            // I mean... technically you could... in a rule, say
            // when query has object, etc, then, there exists a stream source
            //
            return system
              .live_query([[subject, predicate, object]])
              .subscribe(rs.trace("yahoo"));
          });
        }
      }
    ]
  };

  if (meld) meld.register_driver(QUERY_DRIVER);
  else console.warn("No meld system found!");
})();
