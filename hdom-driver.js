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
      /*
      {
        when: q("?node implements ?anything", "?node as ModelDomRoot"),
        then({ node }, { find }) {
          // This is *exactly* what we *don't* want to be doing
          // and yet ultimately this has to happen
          // so the only thing we can say for sure is that things have to be
          // represented as data before they can be connected to a container.
          // this isn't about hiccup or dom, but still those things have to
          // happen.  it's not a "well-known" concept, but it's something.
          // either way, even hdom doesn't address the question of where to put
          // the thing.  I can connect those things with a dataflow
          find(node).appendChild(document.createTextNode("no bro"));
          return {};
        }
      },
       */
    ]
  }));
})();
