import { ExprNode } from "@def.codes/expression-reader";

interface Definition {
  type: "definition";
  term: string;
  expression: Expression;
}

type Statement = Definition;

interface Expression {
  //
}

// is this even a thing?
interface Context {
  //
  resolve(term: string): any;
}

export class System {
  // Bookkeeping objects
  objects: WeakMap<object, string>;
  metadata: Map<string, object>; // for metadata?

  // Bookkeeping work?

  // Bookkeeping IPC

  init() {
    //
  }

  resolve(term: string): any {
    //
  }

  // for side effects, then?
  // transactional?  else why not just one?
  interpret(statements: Iterable<Statement>, context: Context): void {
    //
  }
}
