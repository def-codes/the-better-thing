/// persistent dictionary test
const {
  persistent_monotonic_dictionary,
  ops,
} = require(`${process.cwd()}/lib/persistent-dictionary`);

console.log(`persistent_monotonic_dictionary`, persistent_monotonic_dictionary);

const inst = persistent_monotonic_dictionary();

console.log(`inst`, ops.objectify(inst));

const inst2 = ops.assoc(inst, "foo", 3);
console.log(`inst2`, ops.objectify(inst2));
console.log(`inst2`, [...ops.keys(inst2)]);

const inst3 = ops.assoc(inst2, "bar", true);
console.log(`inst3`, ops.objectify(inst3));
console.log(`inst3`, [...ops.keys(inst3)]);
