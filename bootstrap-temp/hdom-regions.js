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
      init(element, context, args) {
        const { id } = args;
        const { process } = context;
        state.element = element;
        // console.log(`INIT!!`, { element, context, args });
        if (id) process.mounted.next({ id, element });
      },
      render(_ctx, { id }) {
        // turns out the custom impl is not needed
        return ["div", { key: id }];
      },
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
    const templates = new Map(); // template by id, would be deleted only by instruction
    const sources = new Map(); // pubsub topics, same provenance as templates
    const elements = new Map(); // needs removal when element dismounted
    const feeds = new Map(); // ditto

    const pluck_content = tx.map(_ => _.content);
    const content_hub = rs.pubsub({ topic: _ => _.id });
    const ensure_source = id => {
      if (!sources.has(id))
        sources.set(id, content_hub.subscribeTopic(id, pluck_content, OPTS));
      return sources.get(id);
    };

    const process = {};
    const ctx = { process, mounted: _ => process.mounted.next(_) };

    const connect = id => {
      const mounted_elements = elements.get(id);

      if (mounted_elements) {
        // Automatically sends the latest value (if one arrived first)
        for (const element of mounted_elements) {
          if (!feeds.has(element)) {
            let i = 0;
            for (const [k, v] of elements) i += v.size;
            // console.log("NEW FEED", feeds.size, i, id, element);

            feeds.set(
              element,
              ensure_source(id)
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
      content: rs.subscription({
        next(value) {
          const { id, content } = value;
          ensure_source(id);
          templates.set(id, content);
          content_hub.next(value);
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
      unmounted: rs.subscription({
        // do we even need to know id?  yes, to update element books
        next({ id, element }) {
          if (elements.has(id)) elements.get(id).delete(element);
          if (feeds.has(element)) {
            const feed = feeds.get(element);
            // console.log(`REMOVE FEED:`, feed);
            if (feed) feed.unsubscribe();
            feeds.delete(element);
          }
        },
      }),
    });
  };
  return { make_dom_process };
});
