// define(["@def.codes/hdom-regions"], ({ make_dom_process }) => {
define(["./hdom-regions"], ({ make_dom_process }) => {
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

  const run_test_case = (test_case, root) => {
    const streams = test_case();
    const element = root.appendChild(document.createElement("article"));
    // region coordinator, whatever
    const dom_process = make_dom_process();
    dom_process.mounted.next({ id: "root", element });
    for (const [id, stream] of Object.entries(streams))
      stream.subscribe({
        next: template => {
          // console.log(`content`, id, content);
          const content = expression_from_hdom(template);
          dom_process.content.next({ id, content });
        },
      });
  };

  return { run_test_case };
});
