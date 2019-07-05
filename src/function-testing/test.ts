// Non-exported module to make sure that factory typechecks as intended.

import { test_case } from "./make-test-case";

const example = (n: number, { name: string }): boolean => true;

test_case(example, [8, { name: "Fiona" }], !!0);
