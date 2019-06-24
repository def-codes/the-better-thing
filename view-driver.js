// Viewing of dataflow resources
(function() {
  const NAME = "viewDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  const { rdf, value_view } = window;
  const { render, render_value } = value_view;
  const n = rdf.namedNode;
  const ISA = n("isa");

  const RENDER_VALUE = rdf.literal(render_value, n("javascriptFunction"));

  meld.register_driver(NAME, ({ q }) => ({
    claims: q(
      "viewOf domain View"
      // TBD
      // "viewOf range Resource"
      // "contains domain Container",
      // "contains range Content"
    ),
    rules: [
      {
        when: q(
          "?view viewOf ?thing",
          "?thing isa Subscribable",
          "?view viewIn ?container"
        ),
        then: ({ view, thing, container }) => {
          // TODO: Two-part proposal for dealing with this.
          //
          // The more concise way to say this would be something like
          //
          //  ∃
          //    listensTo(listensTo.?thing, transformsWith(mapsWith(RENDER_VALUE))),
          //      transformsWith(hasRoot.?container)
          //
          // Requirement is to keep the implied nodes anonymous but still defend
          // against the rule firing again.
          //
          // Part 1: Support “there exists” conclusions,which may contain
          // unbound variables.  To implement this, you can run a synchronous
          // test when the rule fires.  If it passes (something matches), you're
          // done.  If it fails, then you substitute new blank nodes for the
          // variables and assert the result.
          //
          // Part 2: Support “there exists” conclusions with implicit blank
          // nodes. For cases like this one, where you don't actually need
          // explicit unbound variables in the conclusion.  To implement this,
          // you would need a variant of the Turtle-like expression expander
          // that used (“minted”) variables instead of blank nodes for
          // placeholders.  These unbound variables would be treated as above.
          console.log(`viewOf RULE FIRED`);

          const listener = n(`ListenerFor${view.value}`);
          const listener2 = n(`Listener2For${view.value}`);
          const mapper = n(`MapperFor${view.value}`);
          const xform = n(`HdomFor${view.value}`);
          return {
            assert: [
              [listener, n("listensTo"), thing],
              [listener, n("transformsWith"), mapper],
              [mapper, n("mapsWith"), RENDER_VALUE],
              [listener2, n("listensTo"), listener],
              [listener2, n("transformsWith"), xform],
              [xform, n("hasRoot"), container]
            ]
          };
        }
      }
    ]
  }));
})();
