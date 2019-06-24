// Provide hdom components for representing basic RDF constructs.
// re `var`, see note in value-view.js
var rdf_hdom = (function() {
  const { value_view } = window;
  // NOTE: This view (and any one using `render_value` now assumes that `render`
  // is in context.)

  const as_string = v => (v ? v.toString() : undefined);

  const render_triple = ({ render }, [s, p, o]) => [
    "div.Property",
    {
      "data-subject": as_string(s.value),
      "data-property": as_string(p.value),
      "data-object": as_string(o.value)
    },
    s.value,
    " ",
    p.value,
    " ",
    o.termType === "Literal"
      ? ["div.value-view", [render, { value: o.value }]]
      : o.value
  ];

  const render_triples = (_, triples) => {
    console.orig.log(`triples`, triples);
    // return null;
    return [
      "div.triples",
      "facts",
      tx.map(
        triple => [
          render_triple,
          // TRANSITIONAL: should always use rdf.js form unless directly
          // interoping with rstream-query.
          Array.isArray(triple)
            ? triple
            : [triple.subject, triple.predicate, triple.object]
        ],
        triples
      )
    ];
  };

  return { render_triple, render_triples };
})();
