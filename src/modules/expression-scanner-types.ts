// You can't express the current structure without circular types.  This could
// be avoided if you were to wrap expression sequences in an object property,
// rather than using plain arrays.  I originally insisted on that because of the
// stupid pattern matcher that I was using for Turtle.  But now it's more of a
// bug than a feature.
declare module "expression-scanner" {
  var walk: (x: any, path: []) => IterableIterator<[]>;

  type ExprNode = TermNode | LiteralNode | ArgsNode;

  type LiteralValue =
    | boolean
    | number
    | string
    | Function
    | readonly ExprNode[];

  interface TermNode {
    term: string;
  }

  interface LiteralNode {
    literal: LiteralValue;
  }

  interface ArgsNode {
    args: readonly ExprNode[];
  }
}
