const { read } = require("@def.codes/expression-reader");
const { as_triples } = require("@def.codes/rdf-expressions");
const { inspect } = require("util");

const expressions = read(`home.contains.more
Alice(hasInterval(150))
vv(viewOf.Alice, viewIn.more)

Bob(
  listensTo.Alice,
  transformsWith(partitionsWith({size:5, step: 1})))
home.contains.BobHome
BobView(viewOf.Bob, viewIn.BobHome)

// Carol shows as having the same spec as Bob (5, 1)
// but works correctly (9, 3) if you comment Bob
Carol(
  listensTo.Alice,
  transformsWith(partitionsWith({size:9, step: 3})))
home.contains.CarolHome
CarolView(viewOf.Carol, viewIn.CarolHome)`);
// console.log(`expression`, inspect(expressions, { depth: null }));

for (const expression of expressions) {
  console.log(`expression`, inspect(expression, { depth: null }));
  const triples = as_triples(expression);
  console.log(`triples`, inspect(triples, { depth: null }));
}
