define(["@thi.ng/transducers", "@def.codes/rstream-query-rdf"], (
  { keep, map },
  { factory: { namedNode: n, variable: v } }
) => {
  const ATTRIBUTE_CONTAINS_WORD = /^\[(.+)~="(.+)"\]$/;
  const ATTRIBUTE_EQUALS = /^\[(.+)="(.+)"\]$/;
  const ELEMENT = /^[a-z][a-z0-9]*$/;

  const css_to_assertion = selector => {
    // Order matters here
    const attribute_contains_word = selector.match(ATTRIBUTE_CONTAINS_WORD);
    if (attribute_contains_word) {
      const [, name, value] = attribute_contains_word;
      return { type: "attribute-contains-word", name, value };
    }
    const attribute_equals = selector.match(ATTRIBUTE_EQUALS);
    if (attribute_equals) {
      const [, name, value] = attribute_equals;
      return { type: "attribute-equals", name, value };
    }
    const element = selector.match(ELEMENT);
    if (element) {
      const [name] = element;
      return { type: "uses-element", name };
    }
    return { type: "unknown", selector };
  };

  const MATCHES = n("def:matches");
  const CONTAINS = n("def:contains");
  const CONTAINS_TEXT = n("def:containsText");
  const HAS_STYLE = n("def:hasStyle");

  // Map a pseudo triple to a corresponding DOM operation (if any).
  const operation_from = ([, predicate, object]) => {
    switch (predicate) {
      case MATCHES:
        return css_to_assertion(object.value);
      case CONTAINS:
        return { type: "contains", id: object.value };
      case CONTAINS_TEXT:
        return { type: "contains-text", text: object.value };
      case HAS_STYLE:
        const [, property, value] = object.value.match(/(\S+):(.*)/) || [];
        return { type: "has-style", property, value };
    }
  };

  // Map pseudo triples to corresponding DOM operations.
  const facts_to_operations = facts => keep(map(operation_from, facts));

  return { facts_to_operations };
});
