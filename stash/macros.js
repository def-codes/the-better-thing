// Clearinghouse for code that was previously (and may once again be) used for
// macroexpansion of terms in userland code.
(function() {
  const node_or_blank = x => (is_node(x) ? x : mint_blank());

  function* sequence_as_triples_cycle(seq) {
    const nodes = [...seq];
    const ids = nodes.map(node_or_blank);

    yield* tx.mapIndexed(
      (index, node) => trip(ids[index], "value", node),
      nodes
    );
    yield* tx.map(
      n => trip(ids[n], "linksTo", ids[n < nodes.length - 1 ? n + 1 : 0]),
      tx.range(nodes.length)
    );
  }

  function* sequence_as_triples(seq) {
    const nodes = [...seq];
    const ids = nodes.map(node_or_blank);
    yield* tx.mapIndexed(
      (index, node) => trip(ids[index], "value", node),
      nodes
    );
    yield* tx.map(
      n => trip(ids[n], "linksTo", ids[n + 1]),
      tx.range(nodes.length - 1)
    );
  }
  const query = (...clauses) => {
    const query_id = mint_blank();
    const reified_clauses = clauses
      .map(as_turtle)
      .map(reify_triple(mint_blank()));

    const all = [
      ...tx.mapcat(x => x, reified_clauses),
      ...reified_clauses.map(reified => [
        query_id,
        n("hasClause"),
        reified[0][0]
      ])
    ];
    // TEMP: assert the query
    store.into(all);

    return query_id;
  };

  function mesh(rows, cols, prop) {
    const size = { rows, cols };

    const term = rdf.namedNode(
      (prop && match([([{ key }]) => key], prop)) || "linksTo"
    );

    const ids = [...tx.map(mint_blank, tx.range(rows * cols))];

    const links = tx.iterator(
      tx.mapcat(n =>
        tx.map(
          other => [ids[n], term, ids[other]],
          // THIS is in boggle.js
          neighbors_of_index(size, n)
        )
      ),

      tx.range(rows * cols)
    );

    // this should be a separate step
    store.into(links);
  }

  // TODO: these older adapters are retained only for rules
  // should be able to use `as_turtle` now, right?
  const as_term = step =>
    step.key[0] === "$" ? `?${step.key.slice(1)}` : rdf.namedNode(step.key);
  const as_triple = _ => _.context.map(as_term);

  const reify_triple = id => ([s, p, o]) => [
    [id, n("hasSubject"), s],
    [id, n("hasPredicate"), p],
    [id, n("hasObject"), o]
  ];

  const as_named = expr => expr && match([([{ key }]) => n(key)], expr.context);

  // Helper to add triple-like expressions to the store.
  const claim = (...things) => store.into(tx.keep(things.map(as_turtle)));

  const range = (...args) => store.into(sequence_as_triples(tx.range(...args)));

  const list = (...things) =>
    store.into(
      sequence_as_triples(
        things.map(thing => {
          if (!Array.isArray(thing.context)) throw "list: Not a proxy";
          if (thing.context.length !== 1) throw "list: term is not unary";
          return rdf.namedNode(thing.context[0].key);
        })
      )
    );

  const rule = ({ when, then }) =>
    query(...when)(match =>
      then.forEach(clause =>
        store.add(
          as_triple(clause).map(
            // Map variables in the consequent clause to the matched values.
            term => (term[0] === "?" ? match[term.slice(1)] : term)
          )
        )
      )
    );

  function subgraph(start_expr, follow_expr) {
    const start = as_named(start_expr);
    const follow = as_named(follow_expr);

    if (start) return traverse(store, start, follow);
  }

  function forall(subjects, conclusion) {
    const { o, p } =
      match(
        [([{ key: p }, { key: o }]) => ({ p: n(p), o: n(o) })],
        conclusion.context
      ) || {};

    // Recognize resources with iterable runtime values
    // doesn't work in current examples, though, because of order
    const maybe_term = as_named(subjects);
    if (maybe_term) {
      // get subject's value property and see whether it's a runtime iterable
      const values = all_values_for(store, maybe_term, VALUE);
      if (o && p)
        store.into(tx.map(s => [is_node(s) ? s : as_named(s), p, o], values));
      return;
    }

    if (o && p)
      store.into(tx.map(s => [is_node(s) ? s : as_named(s), p, o], subjects));
  }

  const all_values_for = (store, subject, property) =>
    tx.pluck(
      "object",
      sync_query(store, [[subject, property, rdf.variable("object")]]) || []
    );

  const all_properties_for = (store, subject) =>
    sync_query(store, [
      [subject, rdf.variable("property"), rdf.variable("object")]
    ]) || [];
})();
