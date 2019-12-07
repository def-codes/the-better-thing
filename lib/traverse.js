const { has_items } = require("@def.codes/helpers");

const EMPTY_ARRAY = [];
const DEFAULT_MOVES_FROM = () => EMPTY_ARRAY;
const DEFAULT_VALUE_OF = () => {};
const DEFAULT_ID_OF = x => x;

module.exports.traverse1 = function* traverse1(starts, spec, state) {
  state = state || {};
  spec = spec || {};
  const queue = state.queue || (state.queue = []);
  const visited = state.visited || (state.visited = new Set());
  const moves_from = spec.moves_from || DEFAULT_MOVES_FROM;
  const value_of = spec.value_of || DEFAULT_VALUE_OF;
  const id_of = spec.id_of || DEFAULT_ID_OF;
  for (const start of starts) queue.push(start);

  while (has_items(queue)) {
    const raw = queue.pop();
    const subject = id_of(raw);
    const value = value_of(raw);
    // conditional yield?
    yield { subject, value };
    if (!visited.has(subject))
      for (const [o, data] of moves_from(subject, value)) {
        const object = id_of(o);
        yield { subject, object, data };
        queue.push(o);
      }
    visited.add(subject);
  }
};
