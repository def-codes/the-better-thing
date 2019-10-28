import { test_case } from "@def.codes/function-testing";
import { read } from "../reader";
import { serialize } from "../serializer";

const roundtrip = x => serialize(read(x));

export const TEST_CASES = `OneTerm
a = b
f.y(n => n.weight)
TermWith(SomeArgument)
This.Isa.Triple
x.strength(10)
stream.hasSource(sub => { sub.next("hello"); sub.next("world"); })
who.calls(() => { throw "me"; })
You(get.a.car).You(get.a.car).everybody(gets.a.car)
dict({roses: "red", violets: blue, sugar: true})
names(Alice, Bob, Carol)
names([george, paul, john])
Kilroy.was.here
a = plus(b, c)
you.and(what.$army)
one.for(the.money, two.for.the.show)(3)`
  .split("\n")
  .map(line => test_case(roundtrip, [line], line));
