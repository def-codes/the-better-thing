// Public types for this module.

// You can't express the current structure without circular types.  This could
// be avoided if you were to wrap expression sequences in an object property,
// rather than using plain arrays.  I originally insisted on that because of the
// stupid pattern matcher that I was using for Turtle.  But now it's more of a
// bug than a feature.
export type ExprNode = TermNode | LiteralNode | ArgsNode;

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
