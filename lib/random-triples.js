const { factory } = require("@def.codes/rstream-query-rdf");
const { namedNode: n } = factory;
const random_integer_less_than = n => Math.floor(Math.random() * n);
const random_item_from = array => array[random_integer_less_than(array.length)];

function* generate_triples(spec) {
  spec = spec || {};
  const names = spec.names || [
    ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ];
  while (true) {
    const s = n(random_item_from(names));
    const p = n(random_item_from(names));
    const o = n(random_item_from(names));
    yield [s, p, o];
  }
}

module.exports = { generate_triples };
