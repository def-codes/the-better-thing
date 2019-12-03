const flatten = <T>(arrays: readonly (readonly T[])[]): readonly T[] =>
  Array.prototype.concat(...arrays);

const render_child = (child: Child) =>
  typeof child === "string"
    ? child
    : Array.isArray(child)
    ? child.map(render_child)
    : render(child);

/** Essentially a macroexpand for component expressions. */
export const render = ({
  Component,
  props: { children, ...props },
}: ComponentTree): ElementTree | null => {
  if (typeof Component === "string")
    return {
      tag: Component,
      attributes: props,
      children: flatten((children || []).map(render_child)),
    };
  const tree = Component(props);
  return tree === null ? null : render(tree);
};
