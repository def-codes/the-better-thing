// Public types for this module.

// You can't express the current structure without circular types.  This could
// be avoided if you were to wrap expression sequences in an object property,
// rather than using plain arrays.  I originally insisted on that because of the
// stupid pattern matcher that I was using for Turtle.  But now it's more of a
// bug than a feature.
// *UPDATE* Circular types are in, but this is still bad.  Someone should fix it.
export type ExprNode = TermNode | LiteralNode | ArgsNode | AssignmentNode;

// This doesn't come out as expected for assignments to properties.
export interface AssignmentNode {
  assign: { term: string; value: ExprNode };
}

export interface ArgsNode {
  args: readonly ExprNode[];
}

export interface TermNode {
  term: string;
}

export interface LiteralNode {
  literal: LiteralValue;
}

export type LiteralValue =
  | boolean
  | number
  | string
  | Function
  | readonly ExprNode[];
