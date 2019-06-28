import { with_scanner } from "./expression-scanner.mjs";
import { serialize } from "./expression-serializer.mjs";

// for node
import { createRequireFromPath } from "module";
const require = createRequireFromPath(import.meta.url);
const { inspect } = require("util");

const mint = (function() {
  let count = 0;
  return () => ({ term: { minted: count++ } });
})();

// should mint be in context?

function* expecting_statements(exprs) {
  for (const expr of exprs) yield* expecting_statement(expr, []);
}

function* expecting_statement(expr, context) {
  if (expr.length > 3) throw "Expecting statement: invalid arity";

  const [subject, predicate, object] = expr;
  if (!subject) throw "Expecting statement: missing subject";
  if (!predicate) throw "Expecting statement: missing predicate";
  if (!object) throw "Expecting statement: missing object";

  // Simple triple.
  if (subject.term && predicate.term && object.term) {
    yield [subject, predicate, object];
    return;
  }

  // Subject + predicate with object list.
  if (subject.term && predicate.term && object.args) {
    try {
      const things = [
        ...expecting_object_list(object.args, { subject, predicate })
      ];
      // Don't yield until collection has succeeded.
      yield* things;
      return;
    } catch (error) {
      console.log(`ERROR`, error);
      console.log(`Expecting statement: failed to read object list...`);
      // There's no fallback here...
    }
  }

  throw "Expecting statement: exhausted";
}

function* expecting_predicate_object_list(exprs, context) {
  try {
    const out = [];
    for (const expr of exprs)
      for (const fact of expecting_predicate_object(expr, context))
        out.push(fact);
    yield* out;
  } catch (error) {
    console.log("ERROR: ", error);
    throw "Expecting predicate object list: failed to read predicate object list";
  }
}

function* expecting_predicate_object(expr, { subject }) {
  if (expr.length !== 2) throw "Expecting predicate object: invalid arity";

  const [predicate, object] = expr;
  if (!predicate) throw "Expecting predicate object: missing predicate";
  if (!object) throw "Expecting predicate object: missing object";

  // Simple predicate-object.
  if (predicate.term && object.term) {
    // Predicate object for contextual subject
    if (subject) yield [subject, predicate, object];
    // New minted (blank) node
    // ?????????
    else yield [mint(), predicate, object];
    return;
  }

  if (predicate.term && object.args) {
    try {
      const objects = [
        ...object.args.map(arg =>
          expecting_object_list(arg, { subject, predicate })
        )
      ];
    } catch (error) {
      console.log("ERROR: ", error);
      throw error;
    }
  }

  throw "Expecting predicate object: exhausted";
}

function* expecting_object_list(exprs, context) {
  try {
    const out = [];
    for (const expr of exprs)
      for (const fact of expecting_object(expr, context)) out.push(fact);
    yield* out;
  } catch (error) {
    console.log("ERROR: ", error);
    throw "Expecting object list: failed to read object";
  }
}

function* expecting_object(expr0, { subject, predicate }) {
  //console.log(`EXPECTING OBJECT`, expr);

  if (Array.isArray(expr0)) {
    const [expr] = expr0;
    // For literals, don't we need to “deeply de-literal” here?
    if (expr.literal || expr.term) {
      yield [subject, predicate, expr];
      return;
    }

    try {
      // New context because not connected to containing expr
      // SHOULD BE predicate object? i.e blank node?
      const objects = [
        ...expr.map(expr => expecting_predicate_object(expr, {}))
      ];
      yield* objects;
      // ALSO yield fact based on head of result
      // where object is the (presumably minted) id of the
      const [first] = objects;
      const [object] = first;
      yield [subject, predicate, object];
      return;
    } catch (error) {
      console.log("ERROR: ", error);
      throw "Expecting object: failed to read blank nodes";
    }
  }

  throw "Expecting object: exhausted";
}

const TEST_CASES = [
  _ => _.Alice.knows.Bob,
  _ => _.Alice.knows.Bob.Barker,
  _ => [_.Alice.knows.Bob, _.Alice.knows.Carol],
  _ => _.Alice.knows(_.Bob, _.Carol),
  _ => _.Alice(_.likes.Bob, _.loves.Carol),
  _ => _.Alice.age(95),
  _ => _.Alice.alias("Ali", "Alicia"),
  _ => _.Alice(_.likes(_.Bob, _.Dave), _.loves.Carol),
  _ => _.Alice(_.likes(_.Bob, _.a.Scientist), _.loves.Carol),
  _ => _.Alice(_.likes(_.a.Poet, _.a.Preacher), _.loves.Carol),
  _ => _.Alice(_.likes(_.a(_.Poet, _.Preacher)), _.loves.Carol)
];

function test() {
  for (const test_case of TEST_CASES) {
    console.log(`===`, test_case);
    let exprs, expansion;
    try {
      exprs = with_scanner(test_case);
    } catch (error) {
      console.log("ERROR scanning: ", error);
      continue;
    }

    for (const expr of exprs)
      try {
        const serialized = serialize(expr);
        console.log("expr", serialized);
      } catch (error) {
        console.log("ERROR serializing: ", expr, error);
      }

    try {
      expansion = [...expecting_statements(exprs)];
      console.log(`expansion`, expansion);
    } catch (error) {
      console.log("ERROR expanding: ", error);
      console.log(`exprs`, inspect(exprs, { depth: null }));
    }
  }
}

test();
