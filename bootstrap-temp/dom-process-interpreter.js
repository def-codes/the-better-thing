/*
  GOAL: Graph interpreter that maintains dom process feeds based on templates.
  
  This is probably two things:
  1. construct template-producing function from assertions
  2. map that content into a dom region/placeholder definition
 */
define([
  "@thi.ng/transducers",
  "@thi.ng/rstream",
  "@thi.ng/associative",
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
  "./dom-operations.js",
], (tx, rs, { difference }, rdf, { q }, dom_ops) => {
  const { factory, live_query } = rdf;
  const { css_to_assertion, operations_to_template } = dom_ops;
  const { namedNode: n, variable: v } = factory;

  const MATCHES = n("def:matches");
  const CONTAINS = n("def:contains");
  const CONTAINS_TEXT = n("def:containsText");

  const log = (triples, ...msgs) =>
    console.log(
      ...msgs,
      Array.from(triples || [], ([s, p, o]) => `${s} ${p} ${o}`).join("\n")
    );

  // Map a pseudo triple to a corresponding DOM operation (if any).
  const operation_from = ([, predicate, object]) => {
    switch (predicate) {
      case MATCHES:
        return css_to_assertion(object.value);
      case CONTAINS:
        return { type: "contains", id: object.value };
      case CONTAINS_TEXT:
        return { type: "contains-text", text: object.value };
    }
  };

  // Map pseudo triples to corresponding DOM operations.
  const facts_to_operations = facts => tx.keep(tx.map(operation_from, facts));

  // construct templates from a graph containing representations
  const dom_process_interpreter = ({ representation_graph: graph }) => {
    // Dictionary of (live) template streams for each dom element.
    const streams = new Map();

    // Ensure that there's a template stream IFF there's an element now
    function update_streams(subjects_now) {
      // clean obsolete subs
      for (const [id, sub] of streams)
        if (!subjects_now.has(id)) sub.unsubscribe();

      // add new subs
      for (const id of subjects_now)
        if (!streams.has(id))
          streams.set(
            id,
            graph
              .subject(id)
              .transform(
                tx.map(facts_to_operations),
                tx.map(operations_to_template)
              )
          );
    }

    // Stream a set of all the subjects described as dom elements.
    const elements = live_query(graph, q("?ele isa def:DomElement")).transform(
      tx.map(results => new Set(tx.map(_ => _.ele, results)))
    );

    // THIS is really an effect, but returning the streams as a way to convey to client
    const sources = elements.transform(
      tx.map(terms => {
        update_streams(terms);
        return streams;
      })
    );

    // Stream a set of all the subjects described as having a direct container.
    const contained = live_query(graph, q("?x def:contains ?ele")).transform(
      tx.map(results => new Set(tx.map(_ => _.ele, results)))
    );

    //    elements.subscribe(rs.trace("ELEMENTS"));
    contained.subscribe(rs.trace("CONTAINED"));

    const top_level = rs
      .sync({ src: { elements, contained }, mergeOnly: true })
      .transform(
        tx.map(({ elements, contained }) =>
          difference(elements, contained || new Set())
        )
      );

    return { sources, top_level };
  };

  return { dom_process_interpreter };
});
