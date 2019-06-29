var triple_store_traversal = (function() {
  const TRIPLE_EQUIV = {
    equiv: (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
  };

  /** Iterate all resource-valued triples reachable from any node in `starts`. */
  function traverse_all(store, starts, follow) {
    const queue = [...starts];
    const visited = new Set();
    const out = new thi.ng.associative.ArraySet([], TRIPLE_EQUIV);
    while (queue.length > 0) {
      const subject = queue.pop();
      for (const index of store.indexS.get(subject) || []) {
        const triple = store.triples[index];
        const object = triple[2];
        //        if (is_node(object)) {
        out.add(triple);
        if (!visited.has(object)) {
          visited.add(object);
          queue.push(object);
        }
        //        }
      }
    }
    return out;
  }

  return { traverse_all };
})();
