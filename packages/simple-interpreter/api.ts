export interface TermNode {
  readonly type: "term";
  readonly term: string;
}

export interface LiteralNode {
  readonly type: "literal";
  readonly value: any;
}

export interface ApplyExpression {
  readonly type: "apply";
  readonly fn: Function;
  readonly args: readonly Expression[];
}

export interface AccessExpression {
  readonly type: "access";
  readonly base: Expression;
  // Note that we *cannot* take expressions for index access
  readonly key: string;
}

export interface AssignStatement {
  readonly type: "assign";
  readonly lhs: TermNode | AccessExpression;
  readonly rhs: Expression;
}

// technically assignment statements are also expressions but leaving this out
export type Expression =
  | TermNode
  | LiteralNode
  | ApplyExpression
  | AccessExpression;
export type Statement = AssignStatement;
