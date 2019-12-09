const B = {};
const A = { a: 1, b: B };
B.A = A;
const simple_record = { name: "Joe", age: 89, children: ["Hunter", "Bo"] };
const ac1 = { voltage: 44.4, current: 0.1 };
const ac2 = { voltage: 39.0, current: 1.1 };
const nested_dict = { ac1, ac2 };
const array_of_objects = [
  { name: "Gavin", age: 41 },
  { name: "Kim", age: 39 },
  { name: "Aria", age: 9 },
  { name: "Tremé", age: 7 },
];
const cycle = { B };
const examples = { simple_record, cycle };

exports.some_object_graph = {
  nested_dict,
  array_of_objects,
  something: ["non", "trivial"],
  cycle,
  a_record: { name: "flannery", age: 109 },
  a_record_with_nesting: {
    name: "moishe",
    age: 112,
    children: { jonah: 44, preston: 29 },
  },
  nested: [4, 5, 6, 3, 5, 9, 888],
  nested2: [["james", "jimmy"]],

  a_set: new Set([{ expository: "dialogue" }]),
  a_map: new Map([
    [3, 0],
    [{ blah: "blahhh" }, "BLAH"],
  ]),
};
