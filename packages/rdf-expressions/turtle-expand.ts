// should mint be in context?
import { TermNode, LiteralNode } from "@def.codes/expression-reader";

// Yes, we're still using rstream-query-style triples, but with RDF.js terms.
type MintedNode = { term: { minted: number } };
type PseudoTerm = TermNode | LiteralNode | MintedNode;
type PseudoTriple = [PseudoTerm, PseudoTerm, PseudoTerm];

// You should always have a subject if you have a predicate.  There's not a good
// way to say that right now.
type ReaderContext = { subject?: TermNode | MintedNode; predicate?: TermNode };

type BacktrackableResult = readonly PseudoTriple[] | { error: Error };

interface ScannerFunction {
  (expr, context: ReaderContext): IterableIterator<PseudoTriple>;
}

let count = 0;
const mint = (function() {
  return (): MintedNode => ({ term: { minted: count++ } });
})();

function scan_as(
  fn: ScannerFunction,
  expr,
  context: ReaderContext = {}
): BacktrackableResult {
  try {
    return [...fn(expr, context)];
  } catch (error) {
    return { error };
  }
}

function scan_as_list(
  fn: ScannerFunction,
  exprs,
  context: ReaderContext = {}
): BacktrackableResult {
  const out = [];
  for (const expr of exprs) {
    const facts = scan_as(fn, expr, context);
    if ("error" in facts) return facts;
    out.push(...facts);
  }
  return out;
}

export function* expecting_statements(exprs) {
  // HACK: for testing, reset counter
  count = 0;
  for (const expr of exprs) yield* expecting_statement(expr);
}

export function* expecting_statement(expr) {
  if (expr.length > 3) throw "Expecting statement: invalid arity";

  const [first, second, third] = expr;
  if (!first) throw "Expecting statement: first part is required";
  if (!second) throw "Expecting statement: second part is required";
  if (!first.term) throw "Expecting statement: first part must be a term";

  if (!third) {
    // Simple blank node
    if (second.term) {
      yield [mint(), first, second];
      return;
    }

    const [subject, predicate] = [first, second];

    if (predicate.args) {
      const { args } = predicate;

      // Subject + predicate-object list
      const po_facts = scan_as_list(expecting_predicate_object, args, {
        subject,
      });
      if (!("error" in po_facts)) {
        yield* po_facts;
        return;
      }

      // Predicate + object list: blank node
      const o_facts = scan_as_list(expecting_object, args);
      if (!("error" in o_facts)) {
        yield* o_facts;
        return;
      }
      throw o_facts.error;
    }

    throw "Expecting statement: invalid two-part statement";
  }

  const [subject, predicate, object] = expr;

  // Simple triple.
  if (predicate.term && object.term) {
    yield [subject, predicate, object];
    return;
  }

  // Subject + predicate with object list.
  if (predicate.term && object.args) {
    const o_list_facts = scan_as_list(expecting_object, object.args, {
      subject,
      predicate,
    });
    if (!("error" in o_list_facts)) {
      yield* o_list_facts;
      return;
    }
    // There's no fallback here...
    throw o_list_facts.error;
    throw `Expecting statement: failed to read object list...`;
  }

  throw "Expecting statement: exhausted";
}

// Above are never called recursively.  Below are always called with context.

// expr means an array of elements (term, literal, or array)
// exprs means an array of expr's

const expecting_predicate_object: ScannerFunction = function*(
  expr,
  { subject }
) {
  if (expr.length !== 2) {
    throw "Expecting predicate object: invalid arity";
  }

  const [predicate, object] = expr;
  if (!predicate) throw "Expecting predicate object: missing predicate";
  if (!object) throw "Expecting predicate object: missing object";

  // Simple predicate-object.
  if (predicate.term && object.term) {
    // Predicate object for contextual subject or new anonymous node
    yield [subject || mint(), predicate, object];
    return;
  }

  if (predicate.term && object.args) {
    // Predicate + object list
    const o_list_facts = scan_as_list(expecting_object, object.args, {
      subject,
      predicate,
    });
    if (!("error" in o_list_facts)) {
      yield* o_list_facts;
      return;
    }
  }

  throw "Expecting predicate object: exhausted";
};

const expecting_object: ScannerFunction = function*(
  expr,
  { subject, predicate }
) {
  if ("literal" in expr) {
    yield [subject, predicate, expr];
    return;
  }

  if (!Array.isArray(expr))
    throw "Expecting object: expected array (expression)";

  const [first, second] = expr;

  if (expr.length > 3) throw "Expecting object: invalid arity";
  if (!first) throw "Expecting object: first part is required";

  if (expr.length === 1) {
    if (first.term) {
      yield [subject, predicate, first];
      return;
    }
    throw "Expecting object: invalid unary expression";
  }
  if (expr.length === 2) {
    // Object list.  New context because not connected to containing expr.
    const object_facts = scan_as(expecting_predicate_object, expr, {
      subject: mint(),
    });
    if (!("error" in object_facts)) {
      // In addition to the collected facts, yield a fact (for *this* position)
      // based on head of result where object is the (presumably minted) id of
      // the implicit object.
      const [[object]] = object_facts;
      yield [subject, predicate, object];
      yield* object_facts;
      return;
    }

    throw object_facts.error;
  }

  throw "Expecting object: exhausted";
};
