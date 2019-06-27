interface Start {
  [term: string]: Term;
}
// Could be a subject or a predicate (verb).
interface Term {
  // This doesn't help disambiguate the case below.
  // (...complete: TwoTerms[]):
  //   | PredicateWithObjectList
  //   | SubjectWithPredicateObjectList;
  (
    ...complete: (TwoTerms | PredicateWithObjectList)[]
  ): SubjectWithPredicateObjectList;
  (...partial: ObjectExpr[]): PredicateWithObjectList;
  [term: string]: TwoTerms;
}
// Could be a subject+predicate or a predicate+object.  In the context of a
// subject, it's a predicate+object for that subject.  When standalone, it's a
// blank node.
interface TwoTerms {
  (...objects: ObjectExpr[]): SubjectPredicateWithObjectList;
  [term: string]: Triple;
}
// Same as above, can represent multiple p+o's for a subject, or in a standalone
// context, multiple blank nodes.
interface PredicateWithObjectList {
  type: "PredicateWithObjectList";
}

// In an object context, two terms represent a blank node
type ObjectExpr = ValueTerm | TwoTerms | TriplesExpr;
type TriplesExpr =
  | SubjectWithPredicateObjectList
  | SubjectPredicateWithObjectList
  | PredicateWithObjectList;

// terminal: can expand to multiple triples
interface SubjectWithPredicateObjectList {
  type: "SubjectWithPredicateObjectList";
}
// terminal: can expand to multiple triples
interface SubjectPredicateWithObjectList {
  type: "SubjectPredicateWithObjectList";
}
interface Triple {
  type: "Triple";
}

type LiteralValue = string | number | boolean;
// Can't do this without circularity
//type List = readonly (LiteralValue )[]
type ValueTerm = LiteralValue | Term;

type Foo = (t: Start) => Triple | Triple[] | TriplesExpr | TriplesExpr[];

const foos: Foo[] = [
  _ => _.Alice.knows.Bob,
  _ => [_.Alice.knows.Bob, _.Alice.knows.Carol],
  _ => _.Alice.knows(_.Bob, _.Carol),
  _ => _.Alice(_.likes.Bob, _.loves.Carol),
  _ => _.Alice.age(95),
  _ => _.Alice.alias("Ali", "Alicia"),
  _ => _.Alice(_.likes(_.Bob, _.Dave), _.loves.Carol),
  _ => _.Alice(_.likes(_.Bob, _.a.Scientist), _.loves.Carol),
  _ => _.Alice(_.likes(_.a.Poet, _.a.Preacher), _.loves.Carol),
  _ => _.Alice(_.likes(_.a(_.Poet, _.Preacher)), _.loves.Carol)
  // _ => _.Alice(_.likesInOrder([_.Spaghetti, _.Springtime, _.Spatulas]))
];

// @ts-ignore
const make_start = (): Start => {};
const $T: Start = make_start();

const blah = (_: Start) => _.Alice.knows.Bob;
const bloo: Triple = blah($T);
// CORRECT

const bear = (_: Start) =>
  _.Alice(_.likes(_.Bob, _.a.Scientist), _.loves.Carol);
const BEAR: SubjectWithPredicateObjectList = bear($T);
// CORRECT

// Looks like this is interpreted as
//   p(b.p(b.p.o, b.p.o), b.p.o)
// instead of
//   s(p(b.p.o, b.p.o), p.o)
// AFAIK the type can't be adjusted based on its context.
const bull = (_: Start) =>
  _.Alice(_.likes(_.a.Poet, _.a.Preacher), _.loves.Carol);
const BULL: SubjectWithPredicateObjectList = bull($T);
// INCORRECT!! PredicateWithObjectList
