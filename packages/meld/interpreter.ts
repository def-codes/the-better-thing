// take two
// interpreting expressions
// don't get too attached to anything
import { ExprNode, AssignmentNode } from "@def.codes/expression-reader";

/*
For an expression in the form

    a = timer(n)

where n is a literal
the result should be
an statement that
there is a resource `a` representing an timer (ingress) with argument (interval) 1000

*/

interface InterpreterContext {
  depth: number;
}

const is_assign = (x: ExprNode): x is AssignmentNode => "assign" in x;

// const interpret_term_sequence = (node: readonly ExprNode[], context: InterpreterContext) => {
// }

const as_stream_expression = (node: ExprNode) => {};

const interpret_statement = (node: ExprNode, context: InterpreterContext) => {
  if (Array.isArray(node)) {
    // const result = interpret_term_sequence(node, {depth: context.depth+1})
    // term chain
    node;
  } else if (is_assign(node)) {
    const { term, value } = node.assign;
    if (value) {
      const stream_expression = as_stream_expression(value);
      // context.assert(term, stream_expression);
    }
  } else {
    node;
  }
};

export const interpret = (exprs: readonly ExprNode[][], context) => {
  for (const statements of exprs)
    for (const statement of statements) interpret_statement(statement, context);
};
