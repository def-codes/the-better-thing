import { with_scanner } from "./expression-scanner.mjs";
import { serialize } from "./expression-serializer.mjs";

// will need a lambda for expanding implicit nodes (to vars or bn's)
// maybe just serialize and do that in post-process
// i.e. don't couple to RDF.js here
function expecting_statements(exprs) {
  return exprs.map(expecting_statement);
}
function expecting_statement(expr) {
  if (expr.length > 3) throw "Expecting statement: invalid arity";

  const [one, two, three] = expr;
  if (!one || !two || !three) throw "Expecting statement: missing value";

  // Simple triple.
  if (one.term && two.term && three.term) return [one, two, three];

  // Subject + predicate with object list.
  // Arity of result will be arity of object list?
  // ... no, because the object list could expands
  if (one.term && two.term && three.args) {
    const objlist = expecting_object_list(three.args);
    return objlist.map(obj => [one, two, obj]);
  }

  throw "Expecting statement: exhausted";
}
// should pass subject here?
function expecting_predicate_object_list(exprs) {
  return exprs.map(expecting_predicate_object);
}
// should pass subject here?
function expecting_predicate_object(expr) {
  if (expr.length !== 2) throw "Expecting predicate object: invalid arity";
  const [one, two] = expr;
  if (!one || !two) throw "Expecting predicate object: missing values";
  if (one.term && two.term) return [one, two];
  // But couldn't these expressions also recur?
  if (one.term && two.args) {
    const objects = expecting_object_list(two.args);
    console.log(`objects (NOW WHAT?)`, objects);
    return objects.map(obj => [one, obj]);
  }
}
function expecting_object_list(exprs) {
  return exprs.map(expecting_object);
}
function expecting_object(expr) {
  if (expr.literal) return expr;
  if (Array.isArray(expr)) {
    const blank_node = expecting_predicate_object(expr);
    console.log(`blank_node (NOW WHAT?)`, blank_node);
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
      expansion = expecting_statements(exprs);
      console.log(`expansion`, expansion);
    } catch (error) {
      console.log("ERROR expanding: ", error);
    }
  }
}

test();
