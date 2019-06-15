// Provide hdom components for representing basic RDF constructs.
const { render_triple, render_triples } = (function() {
  const render_triple = (_, [s, p, o]) => [
    "div.Property",
    {
      "data-subject": s.value,
      "data-property": p.value,
      "data-object": o.value
    },
    s.value,
    " ",
    p.value,
    " ",
    o.value
  ];

  const render_triples = (_, triples) => [
    "div.triples",
    "facts",
    tx.map(triple => [render_triple, triple], triples)
  ];

  return { render_triple, render_triples };
})();
