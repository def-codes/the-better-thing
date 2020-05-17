define(["@thi.ng/rstream", "@thi.ng/transducers", "@thi.ng/transducers-hdom"], (
  rs,
  tx,
  th
) => {
  // element is the instance key

  // A stateful thing is needed so that the *element* can be released.
  // Is there any other way to know what element is being released?
  const Template = () => {
    let state = {};
    return {
      init(element, { process }, { id }) {
        state.element = element;
        if (id) process.mounted.next({ id, element });
      },
      render: (_ctx, { id }) => ["div", { key: id }],
      release({ process: { unmounted } }, { id }) {
        // is id even needed?
        unmounted.next({ id, element: state.element });
      },
    };
  };
  const OPTS = { closeOut: rs.CloseMode.NEVER };

  const transform_expression = expression =>
    expression.element === "placeholder"
      ? [Template(), { id: expression.attributes.id }]
      : [
          expression.element,
          expression.attributes || {},
          ...tx.mapIndexed(
            (index, expr) =>
              typeof expr === "string" || typeof expr === "number"
                ? expr.toString()
                : transform_expression(expr),
            expression.children || []
          ),
        ];

  const make_dom_process = () => {
    const sources = new Map(); // a read/write subscription for each id
    const elements = new Map(); // needs removal when element dismounted
    const feeds = new Map(); // ditto

    const process = {};
    const ctx = { process };

    const port = id => {
      if (!sources.has(id)) {
        sources.set(id, rs.subscription(id, OPTS));
        connect(id);
      }
      return sources.get(id);
    };

    const connect = id => {
      const mounted_elements = elements.get(id);

      if (mounted_elements) {
        // Automatically sends the latest value (if one arrived first)
        for (const element of mounted_elements) {
          if (!feeds.has(element)) {
            feeds.set(
              element,
              port(id)
                .transform(
                  tx.map(transform_expression),
                  th.updateDOM({ root: element, ctx })
                )
                .subscribe({ error: error => console.error("UPDATE", error) })
            );
          }
        }
      }
    };

    return Object.assign(process, {
      port,
      define(id, content) {
        port(id).next(content);
      },
      mounted: rs.subscription({
        next(value) {
          const { id, element } = value;
          if (!elements.has(id)) elements.set(id, new Set());
          elements.get(id).add(element);
          connect(id);
        },
        error: error => console.error("error: mounted", error),
      }),
      unmounted: rs.subscription({
        // do we even need to know id?  yes, to update element books
        next({ id, element }) {
          if (elements.has(id)) elements.get(id).delete(element);
          if (feeds.has(element)) {
            const feed = feeds.get(element);
            if (feed) feed.unsubscribe();
            feeds.delete(element);
          }
        },
      }),
    });
  };

  return { make_dom_process };
});
