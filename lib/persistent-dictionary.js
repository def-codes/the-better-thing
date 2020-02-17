// Persistent monotonic dictionary using prototypes
// extension of technique used in in `naive-sat`

const SIZE = Symbol("size");

const PROTO = Object.create(null, { [SIZE]: { value: 0 } });

const size = dict => dict[SIZE];
const has = (dict, key) => key in dict;
const get = (dict, key) => dict[key];
function* keys(dict) {
  // This works but doesn't preserve expected order
  // for (const key in dict) yield key;
  const chain = [];
  let x = dict;
  while (x !== null) {
    chain.unshift(x);
    x = Object.getPrototypeOf(x);
  }
  for (const x of chain) for (const key in x) yield key;
}
function* entries(dict) {
  for (const key of keys(dict)) yield [key, dict[key]];
}
const assoc = (dict, key, value) =>
  Object.create(dict, {
    [key]: { value, enumerable: true },
    [SIZE]: { value: dict[SIZE] + 1 },
  });
const parent = dict => Object.getPrototypeOf(dict);
const objectify = dict => Object.fromEntries(entries(dict));

// I mean you could return the prototype directly...
const persistent_monotonic_dictionary = () => Object.create(PROTO);

module.exports = {
  persistent_monotonic_dictionary,
  ops: { parent, assoc, has, keys, entries, size, objectify },
};
