const { equiv } = require("@thi.ng/equiv");
const { run_test } = require("@def.codes/function-testing");
const { inspect } = require("util");
const { polymethod } = require("@def.codes/polymorphic-functions");
const { defmulti } = require("@thi.ng/defmulti");

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

foo.extend_by_prototype(Number, n => [[[[[[n]]]]]]);
foo.extend_by_prototype(A, () => `AAA`);
foo.extend_by_prototype(B, () => `BBBB`);

// const res1 = foo("alpha");
const res2 = foo(4);

// log(`res1`, res1);
log(`res2`, res2);

const resa = foo(new A());
const resb = foo(new B());

log(`resa`, resa);
log(`resb`, resb);
