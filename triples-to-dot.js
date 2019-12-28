const dot = require("@def.codes/graphviz-format");
const tx = require("@thi.ng/transducers");
const { TripleStore } = require("@thi.ng/rstream-query");
const { MIND_MAP } = require("./lib/mind-map");

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
store.add(["thinking it over", "is a", "thing to do"]);
// store.add(["s", "p", "b"]);
// store.add(["s", "p", "c"]);
// store.add(["s", "p", "d"]);
// store.add(["s", "p", "e"]);
// store.add(["s", "p", "f"]);
// store.add(["s", "p", "g"]);
// store.add(["s", "p", "h"]);
// store.add(["s", "p", "i"]);
// store.add(["s", "p", "j"]);
store.add(["Bob", "fatherOf", "Joe"]);
store.add(["Alice", "hasSpouse", "Bob"]);
store.add(["Bob", "hasSpouse", "Alice"]);
store.add(["Jill", "loves", "Alice"]);

// exports.display = { dot_statements: notate_store(store) };

console.log(`MIND_MAP["@graph"].length`, MIND_MAP["@graph"].length);

const dot_statements = [
  ...tx.iterator(
    tx.comp(
      tx.map(function*(node) {
        const { id, label, partOf, comment } = node;
        // would be a bnode
        if (!id) {
          console.log(`NO id`, node);
          return;
        }

        yield {
          type: "node",
          id,
          attributes: { label: label || id, tooltip: comment },
        };
        if (partOf) yield { type: "edge", from: id, to: partOf };
      }),
      tx.flatten()
    ),
    MIND_MAP["@graph"]
  ),
];

// exports.display = { thing: MIND_MAP["@graph"] };
exports.display = { dot_statements };
