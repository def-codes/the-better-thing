const { DGraph } = require("@thi.ng/dgraph");

const rand = n => Math.floor(n * Math.random());

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
exports.random_dgraph = (cardinality, max_degree, ids = ALPHABET) => {
  if (typeof cardinality !== "number") cardinality = rand(ids.length);
  if (typeof max_degree !== "number") max_degree = Math.floor(cardinality / 4);

  const dg = new DGraph();

  for (let x = cardinality; x > 0; x--) {
    const sub = ids[rand(ids.length)];
    dg.addNode(sub);
    for (let y = rand(max_degree); y > 0; y--) {
      // const obj = letters[rand(letters.length)];
      // avoid circular by always taking from later
      const obj = ids[x + rand(ids.length - x)];
      try {
        dg.addDependency(sub, obj);
      } catch (error) {
        // probably a circular dependency
        console.log(`couldn't add dependency: ${sub} => ${obj}`, error);
      }
    }
  }

  return dg;
};

// dg.addNode("a");
// dg.addNode("b");
// dg.addNode("c");
// dg.addDependency("a", "c");
// dg.addDependency("a", "b");
