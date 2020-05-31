export type DomExpression = string | number | DomElementExpression;

export interface DomElementExpression {
  readonly element: string;
  readonly attributes: { [name: string]: any };
  // In practice I've seen this be undefined, maybe just allow it to ensure defense
  readonly children: readonly DomExpression[];
}

// How to overload this so that attributes are optional?
export const h = (
  element: string,
  attributes: object,
  ...children: DomExpression[]
): DomElementExpression => ({ element, attributes: attributes, children });
