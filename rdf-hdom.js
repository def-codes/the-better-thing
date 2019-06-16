// Provide hdom components for representing basic RDF constructs.
// re `var`, see note in value-view.js
var rdf_hdom = (function() {
  const { value_view } = window;
  const { render_value } = value_view;

  const as_string = v => (v ? v.toString() : undefined);

  const render_triple = (_, [s, p, o]) => [
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
    o.termType === "Literal" ? [render_value, { value: o.value }] : o.value
  ];

  const render_triples = (_, triples) => [
    "div.triples",
    "facts",
    tx.map(triple => [render_triple, triple], triples)
  ];

  return { render_triple, render_triples };
})();
