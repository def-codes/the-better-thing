/*
  GOAL: Graph interpreter that maintains template functions based on subjects.

  Creates a stream emitting a thunk that 
 */
define([
  "@thi.ng/transducers",
  "@thi.ng/rstream",
  "@thi.ng/associative",
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
  "@def.codes/dom-rules",
  "./dom-fact-mapping.js",
], ({ map }, rs, { difference }, rdf, { q }, dom_ops, dom_fact) => {
  const { live_query } = rdf;
  const { facts_to_operations } = dom_fact;
  const { operations_to_template } = dom_ops;

  // construct templates from a graph containing representations
  const dom_process_interpreter = graph => {
    // Dictionary of (live) template streams for each dom element.
    const streams = new Map();

    // Ensure that there's a template stream IFF there's an element now
    function update_streams(subjects_now) {
      // add new subs
      for (const id of subjects_now)
        if (!streams.has(id))
          streams.set(
            id,
            graph
              .subject(id)
              .transform(map(facts_to_operations), map(operations_to_template))
          );

      // clean obsolete subs
      for (const id of [...streams.keys()])
        if (!subjects_now.has(id)) {
          streams.get(id).unsubscribe();
          streams.delete(id);
        }
    }

    // Stream a set of all the subjects described as dom elements.
    const elements = live_query(graph, q("?ele isa def:DomElement")).transform(
      map(results => new Set(map(_ => _.ele, results)))
    );

    // THIS is really an effect, but returning the streams as a way to convey to client
    const sources = elements.transform(
      map(terms => {
        update_streams(terms);
        return streams;
      })
    );

    // Stream a set of all the subjects described as having a direct container.
    const contained = live_query(graph, q("?x def:contains ?ele")).transform(
      map(results => new Set(map(_ => _.ele, results)))
    );

    const top_level = rs
      .sync({ src: { elements, contained }, mergeOnly: true })
      .transform(
        map(_ => difference(_.elements || new Set(), _.contained || new Set()))
      );

    return { sources, top_level };
  };

  return { dom_process_interpreter };
});
