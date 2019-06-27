// Turtle macros for Javascript.
//
// What would Turtle's syntactical sugar look like in plain javascript?
//
// Objective is to capture Turtle's terseness for common constructs in a
// consistent way while providing an unambiguous mapping to triples.  There
// should be a clear mapping to “crazy Javascript” (see reader) but not depend
// on it, i.e. no bare terms or arbitrary key access.
//
// So the basic tools at our disposal are:
// - function call : f(...args)
// - array literal : [...items]
// - object literal : {...properties}
//
// Following are the constructs from the Turtle spec.
// https://www.w3.org/TR/turtle/#language-features
//
// Suppose we have a single entry point for a macro, `T$`.

//=== 2.1 Simple Triples
//
//    s p o .
$T(s, p, o);

// === 2.2 Predicate Lists
//
//    s p1 o1 ; p2 o2 .
//
// Closest for the predicate list itself seems to be just an object.  So 2-ary
// with an object in position 2?
$T(s1, { p1: o1, p2: o2 });

// Alternately, a literal could be seen as a blank node, which would allow it to
// represent a standalone value.

// ===2.3 Object Lists
//
//    s p o1 , o2 .
//
// This is not the same as `p` having a collection value.  It means multiple
// triples.  Any arity greater than 3 is interpreted this way?  It doesn't
// distinguish the first two parts.
$T(s, p, o1, o2);
// OR
$T(s, p, [o1, o2]); // but how do you know this isn't an array literal, or a list?

// 2.4 IRI's
//
//    <#relative>
//    <http://absolute>
//    with:prefix
//
// I'm not opposed to e.g. mutating String prototype in principle, though the
// code must assume this has already been done.
"Square".$;
"BinaryTree".T;

// If you're willing to use a proxy,
$.Square;
$T.BinaryTree;

// 2.5 RDF Literals
//
// A la https://github.com/awwright/node-rdf#treat-native-data-types-as-rdf-data
"Foo".L;
"Hello".lang("en");
"Hello".lang.en;
"Hello".en;
(3).L;
'{"foo":"bar"}'.L("http://json.org");
(x => x * x).L;

// 2.6 RDF Blank Nodes
//
//    _:b p o .
//    s p _:b .
//
// This is about blank nodes with explicit labels.
"anon".B;
"noname"._;

// Or with proxy
_.anon;
_.noname;

// 2.7 Nesting Unlabeled Blank Nodes in Turtle
//
//    [] foaf:knows [ foaf:name "Bob" ] .
//    [ p o ] .
//    [ p1 o1 ; p2 o2 ] .
//    [ p1 o1 , o2 ] .
$T(); // <- blank node
$T(p, o); // this only works if you guarantee o is not a plain object.
// since terms are presumably objects, this is dicey at best.
$T([p, o]);
$T([], p, o); // bnode as subject
$T([p1, o1, p2, o2]); // but how would you tell this from an object list?
$T([], p, [p2, [p3, o3]]);

// Or, as noted above,
// prettier-ignore
{} // <- blank node
// OR
({}.B);
// OR
$T({ p: o });

$T({}, p, o); // bnode as subject
$T({ p1: o1, p2: o2 });
$T({}, p, { p2: { p3, o3 } });
// ^ This is much better than array approach.  Though doesn't address how you'd
// use e.g. variables or blank nodes for keys, not to mention prefixed terms.

// 2.8 Collections
//
//    () p o .
//    s p () .
//    s p ( r1 ) .
//    ( r1 r2 ) p o .
//
// Arrays are one option, though I think an explicit list construct may be
// better.

// If you're willing to use the proxy, you have more options.
_ => _.Alice.knows.Bob;
_ => [_.Alice.knows.Bob, _.Alice.knows.Carol];
_ => _.Alice.knows(_.Bob, _.Carol);
_ => _.Alice(_.likes.Bob, _.loves.Carol);
// Alice likes Bob and Dave, and loves Carol
_ => _.Alice(_.likes(_.Bob, _.Dave), _.loves.Carol);
// Alice likes Bob and also a scientist (who may or may not be Bob)
_ => _.Alice(_.likes(_.Bob, _.a.Scientist), _.loves.Carol);
// Alice likes someone who is a poet and also someone who is a preacher
_ => _.Alice(_.likes(_.a.Poet, _.a.Preacher), _.loves.Carol);
// Alice likes someone who is both a poet and a preacher
_ => _.Alice(_.likes(_.a(_.Poet, _.Preacher)), _.loves.Carol);
// Alice likes an ordered list of things, which makes a blank node (in context).
_ => _.Alice(_.likesInOrder([_.Spaghetti, _.Springtime, _.Spatulas]));
