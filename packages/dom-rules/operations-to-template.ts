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
  let contents: Set<string> | undefined = undefined;
  let text_is: string | undefined;
  for (const operation of operations) {
    // Short-cirtuiting: if you have the expr, return it right now.
    if (operation.type === "is") return operation.expr;

    if (operation.type === "attribute-contains-word") {
      const { name, value } = operation;
      attributes[name] = attributes[name]
        ? attributes[name] + " " + value
        : value;
    } else if (operation.type === "text-is") {
      // Overrides any other child assertions
      text_is = operation.text;
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
      if (contents === undefined) contents = new Set();
      contents.add(operation.id);
    } else if (operation.type === "has-style") {
      // Special case for style because hiccup expects an object, not a string
      const { property, value } = operation;
      if (!attributes["style"]) attributes["style"] = {};
      attributes["style"][property] = value;
    } else {
      console.warn("unsupported operation!", operation);
    }
  }

  // `content` is a functional assertion; only one per id
  // I suppose we could sort by ID here to make it (less non-) deterministic
  if (contents)
    for (const id of contents)
      children.push({ element: "placeholder", attributes: { id } });

  return {
    element,
    attributes,
    children: text_is !== undefined ? [text_is] : children,
  };
};
