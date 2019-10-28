/** A component tree constructor compatible with `React.createElement`. */
export const Create = (
  Component: Component,
  props: AnyProps,
  ...children: (string | ComponentTree)[]
): ComponentTree => {
  return { Component, props: { ...(props || {}), children } };
};

export const React = { createElement: Create };
