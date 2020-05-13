define([
  "@thi.ng/transducers",
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
  "./dom-operations.js",
], (tx, rdf, { q }, dom_ops) => {
  const { factory, sync_query } = rdf;
  const { assertion_from_css, apply_dom_operations } = dom_ops;
  const { namedNode: n, variable: v } = factory;

  const MATCHES = n("def:matches");
  const CONTAINS = n("def:contains");
  const CONTAINS_TEXT = n("def:containsText");

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

    const templates = {};
    for (const { ele } of reps) {
      const matches = sync_query(graph, [[ele, MATCHES, v("sel")]]) || [];
      const contains = sync_query(graph, [[ele, CONTAINS, v("rep")]]) || [];
      const texts = sync_query(graph, [[ele, CONTAINS_TEXT, v("text")]]) || [];
      const operations = [
        ...tx.map(_ => assertion_from_css(_.sel.value), matches),
        ...tx.map(_ => ({ type: "contains", id: _.rep.value }), contains),
        ...tx.map(_ => ({ type: "contains-text", text: _.text.value }), texts),
      ];
      const template = apply_dom_operations(operations);
      templates[ele.value] = template;
    }

    const top_level = Object.keys(templates).filter(it => !contained.has(it));
    return { templates, top_level };
  };

  return { dom_process_interpreter };
});
