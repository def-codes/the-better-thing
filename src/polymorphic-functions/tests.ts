//import { test_case } from "@def.codes/function-testing";
//import {} from "./prototype-registry"
import { polymethod } from "./polymethod";

//export const TEST_CASES = [test_case];

const foo = polymethod();
const bar = polymethod();

foo.extend_by_prototype(Number, n => [[[[[[n]]]]]]);
const res1 = foo("alpha");
const res2 = foo(4);
