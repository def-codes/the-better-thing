const tx = require("@thi.ng/transducers");
const { navbot } = require("@def.codes/polymorphic-hdom");
const { apply_all_built_ins } = require("@def.codes/datafy-node");
const { inspect } = require("util");

apply_all_built_ins();

for (const path of tx.take(50, navbot({ "@type": "Folder", url: "file:///" }))) {
  const [last] = path;
  console.log("path length", path.count, inspect(last, { depth: 2 }));
}
