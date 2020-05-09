define(["@thi.ng/rstream", "@thi.ng/transducers", "@thi.ng/transducers-hdom"], (
  rs,
  tx,
  th
) => {
  const custom = {
    normalizeTree(opts, tree) {
      // console.log(`NORMALIZE TREE`, tree);
      return tree;
    },
    createTree(opts, parent, tree, child, init) {
      console.log(`CREATE TREE`, { parent, tree, child, init });
      const element = document.createElement("blockquote");
      const { ctx } = opts;
      const { process } = ctx;
      const [, attributes] = tree;
      const { id } = attributes;

      if (parent)
        if (child) parent.insertBefore(element, parent.children[child]);
        else parent.appendChild(element);
      if (id) process.mounted.next({ id, element });

      return element;
    },
    hydrateTree(opts, parent, tree, child) {
      console.log(`NOT IMPLEMENTED! HYDRATE TREE`, opts, parent, tree, child);
    },
    diffTree(opts, impl, parent, prev, curr, child) {
      // TODO: Why is this being called with `impl` as second argument?
      const prev_id = prev && prev[1] && prev[1].id;
      const curr_id = curr && curr[1] && curr[1].id;

      if (prev_id !== curr_id) {
        console.log(`People say you *changing*, placeholder`, prev_id, curr_id);
      } else if (prev_id === curr_id) {
        console.log(`Placeholder, you ain't changing`, curr_id);
      }

      console.log("DIFF", { prev_id, curr_id, child });
    },
    ...Object.fromEntries(
      [
        "createElement",
        "createTextElement",
        "getElementById",
        "replaceChild",
        "getChild",
        "removeChild",
        "setAttrib",
        "removeAttribs",
        "setContent",
      ].map(key => [key, (...args) => console.log(`NO!! ${key}`, ...args)])
    ),
  };
  const OPTS = { closeOut: false };

  const transform_expression_0 = (expression, p = new Set()) => {
    console.log(`expression`, expression);
    return expression.element === "xxxxxxxxxxplaceholder"
      ? (p.add(expression.attributes.id),
        ["div", { id: expression.attributes.id }])
      : [
          expression.element,
          expression.attributes || {},
          ...tx.map(
            expr =>
              typeof expr === "string" || typeof expr === "number"
                ? expr.toString()
                : transform_expression(expr, p),
            expression.children || []
          ),
        ];
  };
  const P = Object.getPrototypeOf;
  const is_plain_object = x => x && P(P(x)) === null;
  const transform_expression = ([element, ...rest], p = new Set()) => {
    const [second, ...tail] = rest;
    const n = is_plain_object(second);
    const attributes = n ? second : {};
    const children = n ? tail : rest;
    if (element === "placeholder") {
      console.log(`placeholder`, attributes.id);
      p.add(attributes.id);
      return ["div", { __impl: custom, id: attributes.id }];
    }

    return [
      element,
      attributes || {},
      ...tx.map(
        expr =>
          typeof expr === "string" || typeof expr === "number"
            ? expr.toString()
            : transform_expression(expr, p),
        children || []
      ),
    ];
  };

  const make_dom_process = () => {
    const templates = new Map();
    const elements = new Map();
    const sources = new Map();
    const feeds = new Map();

    const pluck_content = tx.map(_ => _.content);
    const pubsub = rs.pubsub({ topic: _ => _.id });
    const ensure_source = id => {
      if (!sources.has(id))
        sources.set(id, pubsub.subscribeTopic(id, pluck_content, OPTS));
      return sources.get(id);
    };

    const process = {};
    const ctx = { process, mounted: _ => process.mounted.next(_) };

    const connect = id => {
      const mounted_elements = elements.get(id);

      if (mounted_elements) {
        // && !feeds.has(id)) {
        // Automatically sends the latest value (if one arrived first)
        for (const element of mounted_elements) {
          feeds.set(
            id,
            ensure_source(id)
              .transform(
                tx.map(expr => {
                  const things = new Set();
                  return transform_expression(expr, things);
                  console.log(`encountered`, things);
                }),
                th.updateDOM({ root: element, ctx, span: false, keys: false })
              )
              .subscribe({ error: error => console.error("UPDATE", error) })
          );
        }
      }
    };

    Object.assign(process, {
      content: rs.subscription({
        next(value) {
          const { id, content } = value;
          ensure_source(id);
          templates.set(id, content);
          pubsub.next(value);
          connect(id);
        },
        error: error => console.error("error: content", error),
      }),
      mounted: rs.subscription({
        next(value) {
          const { id, element } = value;
          if (!elements.has(id)) elements.set(id, new Set());
          elements.get(id).add(element);
          connect(id);
        },
        error: error => console.error("error: mounted", error),
      }),
      unmounted: rs.subscription({ next(element) {} }),
    });
    return process;
  };
  return { make_dom_process };
});
