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
        when: q("?view viewOf ?thing", "?thing isa Subscribable"),
        then: ({ view, thing }) => {
          // HACK: how to keep these nodes anonymous but still defend against
          // the rule firing again?  Unbound variables in conclusion should be
          // supported generally.
          console.log(`RULE FIRED`);

          const listener = n(`ListenerFor${view.value}`);
          const mapper = n(`MapperFor${view.value}`);
          return {
            assert: [
              [listener, n("listensTo"), thing],
              [listener, n("transformsWith"), mapper],
              [mapper, n("mapsWith"), RENDER_VALUE]
            ]
          };
        }
      }
    ]
  }));
})();
