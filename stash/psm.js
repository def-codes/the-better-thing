const dot = require("@def.codes/graphviz-format");
const tx = require("@thi.ng/transducers");
const { TripleStore } = require("@thi.ng/rstream-query");

const store_facts = store => [
  ...tx.map(([subject, data, object]) => ({ subject, object, data }), store),
  ...tx.map(([subject]) => ({ subject, value: subject }), store),
];

const notate_store = store =>
  dot.statements_from_traversal(store_facts(store), {
    describe_node: (id, val) => ({}),
    describe_edge: ([, , label]) => ({ label }),
  });

const store = new TripleStore();
store.add(["s", "p", "o"]);
store.add(["Bob", "fatherOf", "Joe"]);
store.add(["Alice", "hasSpouse", "Bob"]);
store.add(["Bob", "hasSpouse", "Alice"]);
store.add(["Jill", "loves", "Alice"]);

exports.display = { dot_statements: notate_store(store) };
