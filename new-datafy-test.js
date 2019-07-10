const tx = require("@thi.ng/transducers");
const { navbot } = require("@def.codes/polymorphic-hdom");
const { apply_all_built_ins } = require("@def.codes/datafy-node");
const { inspect } = require("util");

apply_all_built_ins();

for (const data of tx.take(5, navbot({ "@type": "Folder", url: "file:///" }))) {
  console.log(inspect(data, { depth: 2 }));
}
