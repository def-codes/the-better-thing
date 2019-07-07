//import { test_case } from "@def.codes/function-testing";
//import {} from "./prototype-registry"
import { polymethod } from "./polymethod";

//export const TEST_CASES = [test_case];

const foo = polymethod();
const bar = polymethod<string>();

foo.extend(Number, n => [[[[[[n]]]]]]);
foo.extend(RegExp, r => r.test("yes"));
const res1 = foo("alpha");
const res2 = foo(4);

bar.extend(Boolean, b => (b ? "yes" : "no"));
bar.extend(Date, d => d.toISOString());
