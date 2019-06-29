import { read } from "./reader";
import { serialize } from "./expression-serializer";

function run_reader_test(userland_code) {
  for (const line of userland_code.split("\n")) {
    const [expr] = read(line);
    const got = serialize(expr);
    if (got !== line) console.log("FAIL", { expected: line, got }, expr);
  }
}

run_reader_test(
  `OneTerm
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
);
