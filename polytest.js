const { equiv } = require("@thi.ng/equiv");
const { run_test } = require("@def.codes/function-testing");
const { inspect } = require("util");
const { polymethod } = require("@def.codes/polymorphic-functions");
const { defmulti } = require("@thi.ng/defmulti");
const {
  Stream,
  Subscription,
  stream,
  subscription
} = require("@thi.ng/rstream");

const log = (...args) =>
  console.log(...args.map(x => inspect(x, { depth: null })));

class A {}
class B extends A {}

function concept() {
  const t = defmulti(x => Object.getPrototypeOf(x).constructor.name);
  t.add("A", () => "mmmshdfsdf");
  t.isa("B", "A");
  // t.add("B", () => "VBLUBBLUB");
  console.log(`t(new A())`, t(new A()));
  console.log(`t(new B())`, t(new B()));
}

const foo = polymethod();
const bar = polymethod();

foo.extend_by_prototype(Object, () => "Don't objectify me");
foo.extend_by_prototype(Number, n => [[[[[[n]]]]]]);
foo.extend_by_prototype(A, () => `AAA`);
foo.extend_by_prototype(B, () => `BBBB`);
foo.extend_by_prototype(RegExp, r => `don't test me ${r.source}`);
foo.extend_by_iri("xsd:integer", n => `${n}^^int`);
foo.extend_by_iri("xsd:naturalNumber", n => `${n}, naturally`);
foo.extend_by_prototype(Error, e => ({ message: e.message, stack: e.stack }));
foo.extend_by_prototype(Subscription, () => `I will subscribe`);
//foo.extend_by_prototype(Stream, () => `Stream weaver`);

log("4", foo(4));
log('"alpha"', foo("alpha"));
log("A", foo(new A()));
log("B", foo(new B()));
log("Subscription", foo(subscription()));
log("Stream", foo(stream()));
log("Error", foo(new Error("Y get what y pay fer")));
log("/abc/", foo(/abc/));
console.log(
  `{"@type": "xsd:integer"}`,
  foo({
    "@type": "xsd:integer",
    toString: () => "zillions"
  })
);
console.log(
  `{"@type": ["xsd:integer"]}`,
  foo({
    "@type": ["xsd:integer"],
    toString: () => "billions"
  })
);
console.log(
  `{"@type": ["xsd:integer", "xsd:nonNegativeInteger"]}`,
  foo({
    "@type": ["xsd:integer", "xsd:nonNegativeInteger"],
    toString: () => "bojillions"
  })
);
console.log(
  `{"@type": ["xsd:integer", "xsd:nonNegativeInteger", "xsd:naturalNumber"]}`,
  foo({
    "@type": ["xsd:integer", "xsd:nonNegativeInteger", "xsd:naturalNumber"],
    toString: () => "teerillions"
  })
);
console.log(
  `{"@type": ["xsd:naturalNumber", "xsd:integer", "xsd:nonNegativeInteger"]}`,
  foo({
    "@type": ["xsd:naturalNumber", "xsd:integer", "xsd:nonNegativeInteger"],
    toString: () => "brazilians"
  })
);
