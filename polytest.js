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

foo.extend(Object, () => "Don't objectify me");
foo.extend(Number, n => [[[[[[n]]]]]]);
foo.extend(A, () => `AAA`);
foo.extend(B, () => `BBBB`);
foo.extend(RegExp, r => `don't test me ${r.source}`);
foo.extend("xsd:integer", n => `${n}^^int`);
foo.extend("xsd:naturalNumber", n => `${n}, naturally`);
foo.extend(Error, e => ({ message: e.message, stack: e.stack }));
foo.extend(Subscription, () => `I will subscribe`);
//foo.extend_by_prototype(Stream, () => `Stream weaver`);

const AD_HOC_TYPE ="test:AdHocPrototype";
const ad_hoc_prototype = {greeting: "um, hi"};
const typed_ad_hoc_prototype = {"@type": AD_HOC_TYPE};

foo.extend(ad_hoc_prototype, () => `AD HOC`);
foo.extend(typed_ad_hoc_prototype, () => `ad hoc by PROTOTYPE`);
foo.extend(AD_HOC_TYPE, () => `ad hoc by @TYPE`);

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
log("ad hoc", foo(Object.create(ad_hoc_prototype)));
log("typed ad hoc", foo(Object.create(typed_ad_hoc_prototype)));
