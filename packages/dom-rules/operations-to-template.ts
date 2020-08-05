import { make_dom_process } from "@def.codes/hdom-regions";
import type { DomAssertion } from "./api";
import type { DomElementExpression } from "@def.codes/hdom-regions";
// Looks like this returns dom expression

export const operations_to_template = (
  operations: Iterable<DomAssertion>
): DomElementExpression => {
  let element = "div";
  let key = 0;
  const attributes = {};
  const children = [];

  for (const operation of operations) {
    // Short-cirtuiting: if you have the expr, return it right now.
    if (operation.type === "is") return operation.expr;

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
    } else if (operation.type === "has-style") {
      // Special case for style because hiccup expects an object, not a string
      const { property, value } = operation;
      if (!attributes["style"]) attributes["style"] = {};
      attributes["style"][property] = value;
    } else {
      console.warn("unsupported operation!", operation);
    }
  }

  return { element, attributes, children };
};
