define([], () => {
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

  // dom operations
  const operations_to_template = operations => {
    let element = "div";
    let key = 0;
    const attributes = {};
    const children = [];
    for (const operation of operations) {
      if (operation.type === "attribute-contains-word") {
        const { name, value } = operation;
        attributes[name] = attributes[name]
          ? attributes[name] + " " + value
          : value;
      } else if (operation.type === "attribute-equals") {
        attributes[operation.name] = operation.value;
      } else if (operation.type === "uses-element") {
        element = operation.name;
      } else if (operation.type === "contains-text") {
        // Ideally, we'd tie this back to the rule that created it
        children.push({
          element: "span",
          attributes: { key: (key++).toString(), "data-from-rule": "" },
          children: [operation.text],
        });
      } else if (operation.type === "contains") {
        const { id } = operation;
        children.push({ element: "placeholder", attributes: { id } });
      } else {
        console.warn("unsupported operation!", operation);
      }
    }
    return { element, attributes, children };
  };

  return { css_to_assertion, operations_to_template };
});
