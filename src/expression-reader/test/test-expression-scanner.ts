import { with_scanner } from "../scanner";
import { read } from "../reader";

// for node
//const { inspect } = require("util");

function test_scanner() {
  const ex = _ => [
    _.Alice.knows.Bob,
    _.Bob.loves.Alice(_.bearbags),
    _.Carol.alias("Foo", "Bar")
  ];
  const normalized = with_scanner(ex);
  //console.log(`normalized`, inspect(normalized, { depth: 5 }));
}

function test_reader() {
  const SOME_CODE = `Hallo.World; Bar.baz`;
  const blah = read(SOME_CODE);
  console.log(`blah`, blah);
}

//test_scanner();
test_reader();
