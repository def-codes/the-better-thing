/*
import { ProjectorSpec, deep_equals, project_many } from "mindgrub";

const data_1 = [
  { name: "Jimmeh", age: 23, friends: ["Beatrice"] },
  { name: "Beulah", age: 98, friends: ["Eunice", "Jimmeh"] },
  { name: "Majorie", age: -3 },
  { name: "Abraham", age: -3, friends: ["Jimmeh"] },
];

interface FunctionTestCase<T> {
  fn: (...args: any[]) => T;
  args: any[];
  expected: T;
}

// @ts-ignore: WIP
const projector_2: ProjectorSpec = { project: "prop", prop: "age" };

const test_projection = (projector, data) => [...project_many(projector)(data)];

const cases: FunctionTestCase<any[]>[] = [
  {
    args: [{ project: "prop", prop: "name" }, data_1],
    fn: test_projection,
    expected: ["Jimmeh", "Beulah", "Majorie", "Abraham"],
  },
  {
    args: [{ project: "iterate", prop: "friends" }, data_1],
    fn: test_projection,
    expected: ["Beatrice", "Eunice", "Jimmeh", "Jimmeh"],
  },
  {
    args: [{ project: "iterate", prop: "friends" }, data_1],
    fn: test_projection,
    expected: ["Beatrice", "Eunice", "Jimmeh", "Jimmeh"],
  },
];

const with_results = cases.map(test => {
  const { args, fn, expected } = test;
  const got = (fn as Function)(...args);
  return { ...test, got, passed: deep_equals(got, expected) };
});

// @ts-ignore: WIP
const projection_tests = {
  with_results,
  foo: "barsdflkjsdlfkjsdlfksjd",
  // data_1,
  // result_1,
  // result_2,
};
*/
