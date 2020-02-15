// adapter.  Could use JSON-LD, etc etc
function* states_to_triples(states, { namedNode: n, literal: l }) {
  for (const [key, { label, borders }] of Object.entries(states)) {
    yield [n(key), n("rdf:type"), n("us:State")];
    yield [n(key), n("rdf:label"), l(label)];
    for (const bordering of borders) {
      // NAMESPACE?
      yield [n(key), n("us:borders"), n(bordering)];
      // I think they are symmetrical, but in case they are not
      yield [n(bordering), n("us:borders"), n(key)];
    }
  }
}

const { factory } = require("@def.codes/rstream-query-rdf");
const usa_states = require("./usa-states.json");
const usa_states_triples = [...states_to_triples(usa_states, factory)];

module.exports = { usa_states_triples };
