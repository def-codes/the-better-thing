define([], () => {
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

  return { operations_to_template };
});
