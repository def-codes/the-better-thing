/** Create a DOM tree from a structured representation. */
export const dom_render = (tree: ElementTree): HTMLElement => {
  const { tag, attributes, children } = tree;

  const element = document.createElement(tag);

  if (attributes)
    // Will need to map className here
    for (let key of Object.keys(attributes))
      element.setAttribute(key, attributes[key]);

  if (children)
    for (let child of children)
      element.appendChild(
        typeof child === "string"
          ? document.createTextNode(child)
          : dom_render(child)
      );

  return element;
};
