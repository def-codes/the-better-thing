(function() {
  const NAME = "hdomDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  const { transducersHdom } = thi.ng;
  const { updateDOM } = transducersHdom;

  meld.register_driver(NAME, ({ q }) => ({
    claims: q(
      "DomContainer isa Class",
      "HdomTransducer subclassOf Transducer",
      "hasRoot domain HdomTransducer",
      "hasRoot range DomElement"
    ),
    rules: [
      {
        when: q(
          "?subject hasRoot ?container",
          "?element implements ?container"
        ),
        // Reify the hdom transducer
        then: ({ subject, element }, { find }) => ({
          register: {
            subject,
            // See notes elsewhere
            // as_type: "HdomTransducer",
            as_type: "Transducer",
            get: () => updateDOM({ root: find(element) })
          }
        })
      }
    ]
  }));
})();
