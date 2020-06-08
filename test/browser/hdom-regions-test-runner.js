define(["@def.codes/hdom-regions"], ({ make_dom_process }) => {
  // Convert example templates into the form expected by processor.
  const P = Object.getPrototypeOf;
  const is_plain_object = x => x && P(P(x)) === null;

  const expression_from_hdom = ([element, ...rest]) => {
    const [second, ...tail] = rest;
    const [attributes, children] = is_plain_object(second)
      ? [second, tail]
      : [{}, rest];
    return {
      element,
      attributes: attributes || {},
      children: Array.from(children || [], (expr, index) =>
        typeof expr === "string" || typeof expr === "number"
          ? expr.toString()
          : expression_from_hdom(expr)
      ),
    };
  };

  const run_test_case = (item, root, id) => {
    const { fn, label = id } = typeof item === "function" ? { fn: item } : item;
    const streams = fn();
    const container = root.appendChild(document.createElement("article"));
    container.appendChild(document.createElement("p")).innerText = label;
    const element = container.appendChild(document.createElement("output"));
    // region coordinator, whatever
    const dom_process = make_dom_process();
    dom_process.mounted.next({ id: "root", element });
    for (const [id, stream] of Object.entries(streams))
      stream.subscribe({
        next: template => {
          // console.log(`content`, id, content);
          const content = Array.isArray(template)
            ? expression_from_hdom(template)
            : template;
          dom_process.define(id, content);
        },
      });
  };

  return { run_test_case };
});
