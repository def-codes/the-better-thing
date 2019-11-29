export interface TermNode {
  readonly type: "term";
  readonly term: string;
}

export interface LiteralNode {
  readonly type: "literal";
  readonly value: any;
}

export interface ApplyExpression<E = Expression> {
  readonly type: "apply";
  readonly base: E;
  readonly args: readonly E[];
}

export interface AccessExpression<E = Expression> {
  readonly type: "access";
  readonly base: E;
  // Note that we *cannot* take expressions for index access
  readonly key: string;
}

export interface AssignStatement {
  readonly type: "assign";
  readonly lhs: TermNode | AccessExpression;
  readonly rhs: Expression;
}

// technically assignment statements are also expressions but leaving this out

// Expressions with no open variables.  They can be evaluated without a context.
export type ClosedExpression =
  | LiteralNode
  | ApplyExpression<ClosedExpression>
  | AccessExpression<ClosedExpression>;

// Expressions that may have open variables.
export type Expression = ClosedExpression | TermNode;

// Not currently used
// export type Statement = AssignStatement;

export type Context = Record<string, Expression>;
