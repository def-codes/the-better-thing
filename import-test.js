const { q } = require("@def.codes/meld-core");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");

const dump = (prefix, store) =>
  console.log(
    prefix,
    "\n",
    store.triples.map(([s, p, o]) => `${s} ${p} ${o}`).join("\n")
  );

const store1 = new RDFTripleStore(q("a p b", "b p c", "c p a"));
const store2 = new RDFTripleStore(q("a p b", "_:b p _:c", "c p _:a"));
const store3 = new RDFTripleStore(
  q("d e f", "_:g h i", "c p _:a"),
  store2.blank_node_space_id
);

dump(1, store1);
dump(2, store2);

store1.import(store2.triples);
dump(1, store1);

store1.import(store2.triples);
dump(1, store1);

store1.import(store2.triples);
dump(1, store1);

console.log(`STORE 2 BEFORE`);
dump(2, store2);
console.log(`IMPORTING`);
dump(3, store3);
store2.import(store3.triples);
console.log(`STORE 2 AFTER`);
dump(2, store2);
