// reminder that when you assert entailment via bnode mapping, you didn't
// actually check this for each mapped triple
const { inspect } = require("util");
for (const { entailed } of mappings) {
  if (entailed) {
    const failed = entailed.filter(_ => !target_store.has(_.mapped));
    if (failed.length)
      console.log(`ASSERTS FAILED:`, inspect(failed, { depth: 5 }));
    else console.log(`All assertions passed!!!`);
  }
}
