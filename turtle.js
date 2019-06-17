(function() {
  const { namedNode: n, variable: v, literal: l, blankNode: b } = rdf;

  // named node or variable
  const nv = key => (key[0] === "$" ? v(key.slice(1)) : n(key));

  // maybe literal: take as literal unless already a term
  const ml = val => (val.termType ? val : l(val));

  // default context.  treat expressions kind of like turtle
  // we can't tell whether brackets or dot was used for get
  // so we treat all keys as tokens (terms)
  // Actually would need to recur here (as_turtle) on s & p, etc
  const TURTLE_PATTERNS = [
    ([{ key: s }, { key: p }, { key: o }]) => [nv(s), nv(p), nv(o)],
    // prettier-ignore
    ([{ key: s }, { key: p }, { args: [o]}]) => [nv(s), nv(p), ml(o)],
    // ^ could the literal position meaningfully be a variable there?
    ([{ key: p }, { key: o }]) => [b(), nv(p), nv(o)]
  ];

  const as_turtle = expression =>
    expression && match(TURTLE_PATTERNS, expression.context);
})();
