define([
  "@thi.ng/transducers",
  "@def.codes/rstream-query-rdf",
  "./dom-operations.js",
], (
  { keep, map },
  { factory: { namedNode: n, variable: v } },
  { css_to_assertion, operations_to_template }
) => {
  const MATCHES = n("def:matches");
  const CONTAINS = n("def:contains");
  const CONTAINS_TEXT = n("def:containsText");

  // Map a pseudo triple to a corresponding DOM operation (if any).
  const operation_from = ([, predicate, object]) => {
    switch (predicate) {
      case MATCHES:
        return css_to_assertion(object.value);
      case CONTAINS:
        return { type: "contains", id: object.value };
      case CONTAINS_TEXT:
        return { type: "contains-text", text: object.value };
    }
  };

  // Map pseudo triples to corresponding DOM operations.
  const facts_to_operations = facts => keep(map(operation_from, facts));

  return { facts_to_operations };
});
