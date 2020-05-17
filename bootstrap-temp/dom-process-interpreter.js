/*
  GOAL: Graph interpreter that maintains dom process feeds based on templates.
  
  This is probably two things:
  1. construct template-producing function from assertions
  2. map that content into a dom region/placeholder definition
 */
define([
  "@thi.ng/transducers",
  "@thi.ng/rstream",
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
  "./dom-operations.js",
], (tx, rs, rdf, { q }, dom_ops) => {
  const { factory, sync_query } = rdf;
  const { assertion_from_css, apply_dom_operations } = dom_ops;
  const { namedNode: n, variable: v } = factory;

  const MATCHES = n("def:matches");
  const CONTAINS = n("def:contains");
  const CONTAINS_TEXT = n("def:containsText");

  const log = (triples, ...msgs) =>
    console.log(
      ...msgs,
      Array.from(triples || [], ([s, p, o]) => `${s} ${p} ${o}`).join("\n")
    );

  // construct templates from a graph containing representations
  const dom_process_interpreter = ({ representation_graph: graph }) => {
    // Get all the things that are dom representations and all their facts
    const reps = sync_query(graph, q("?ele isa def:DomElement")) || [];
    const contained = new Set(
      tx.map(
        _ => _.contained.value,
        sync_query(graph, q("?x def:contains ?contained")) || []
      )
    );

    const facts_about = subject => {
      // sync_query(graph, [[subject, v("predicate"), v("object")]]);
      let results;
      graph
        .subject(subject)
        .subscribe({ next: value => (results = [...value]) })
        .unsubscribe();
      log(results, subject + ":\n");

      return results;
    };

    const templates = {};
    for (const { ele } of reps) {
      const operations = [
        ...tx.keep(
          tx.map(([, predicate, object]) => {
            switch (predicate) {
              case MATCHES:
                return assertion_from_css(object.value);
              case CONTAINS:
                return { type: "contains", id: object.value };
              case CONTAINS_TEXT:
                return { type: "contains-text", text: object.value };
            }
          }, facts_about(ele))
        ),
      ];

      const template = apply_dom_operations(operations);
      templates[ele.value] = template;
    }

    const top_level = Object.keys(templates).filter(it => !contained.has(it));
    return { templates, top_level };
  };

  return { dom_process_interpreter };
});
