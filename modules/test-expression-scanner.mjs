import { make_scanner, normalize } from "./expression-scanner.mjs";
import { read } from "./reader.mjs";

import { createRequireFromPath } from "module";
const require = createRequireFromPath(import.meta.url);

const { inspect } = require("util");

function test_scanner() {
  const contexts = [];
  const scanner = make_scanner(contexts);
  const ex = _ => [
    _.Alice.knows.Bob,
    _.Bob.loves.Alice(_.bearbags),
    _.Carol.alias("Foo", "Bar")
  ];
  ex(scanner);
  const normalized = normalize(contexts);
  console.log(`normalized`, inspect(normalized, { depth: 5 }));
}

function test_reader() {
  const SOME_CODE = `Hallo.World; Bar.baz`;
  const blah = read(SOME_CODE);
  console.log(`blah`, blah);
}

test_scanner();
