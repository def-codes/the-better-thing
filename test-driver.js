// clearinghouse for rules under development
(function() {
  const NAME = "testDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  const { rstream: rs, transducers: tx } = thi.ng;

  meld.register_driver(NAME, ({ q }) => ({
    claims: q(),
    rules: [
      // Hack to support multiple containers.  I think this would even support
      // nested containers, though I have no designs on that for this temporary
      // approach.
      {
        when: q(
          // in practice, parent is going to be host
          "?parent contains ?child",
          "?container implements ?parent",
          "?container as Container"
        ),
        then: ({ parent, child, container }, { find }) => ({
          register: {
            subject: child,
            as_type: "Container",
            get: () =>
              find(container).appendChild(document.createElement("div"))
          }
        })
      },
      {
        when: q("?subject isa AllFacts"),
        then: ({ subject }, { unstable_live_query: query }) => ({
          register: {
            subject,
            as_type: "Subscribable",
            get: () =>
              query(q("?subject ?predicate ?object")).transform(
                tx.map(results =>
                  // MUTATING!
                  // Also, these are not rdf.js triples.
                  // HACK: @type is just a signal to value view
                  Object.assign(results, { "@type": "triples" })
                )
              )
          }
        })
      }
    ]
  }));
})();
