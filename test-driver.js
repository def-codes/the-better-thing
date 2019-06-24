// clearinghouse for rules under development
(function() {
  const NAME = "testDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  const { rstream: rs, transducers: tx } = thi.ng;

  meld.register_driver(NAME, ({ q }) => ({
    claims: q(),
    rules: [
      {
        when: q("?subject isa AllFacts"),
        then: ({ subject }, { unstable_live_query: query }) => ({
          register: {
            subject,
            as_type: "Subscribable",
            get: () =>
              query(q("?subject ?predicate ?object")).transform(
                tx.map(results =>
                  Object.assign(results, { "@type": "triples" })
                )
              )
          }
        })
      }
    ]
  }));
})();
