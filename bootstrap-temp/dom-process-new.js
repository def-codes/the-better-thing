// dom process take 2. TODO: move this to package
//
// NOTE: expects you to provide your own spans and keys
define(["@thi.ng/rstream", "@thi.ng/transducers", "@thi.ng/transducers-hdom"], (
  rs,
  tx,
  th
) => {
  // TODO: support dismount
  // TODO: support cleanup (delete cache)
  // TODO: support changing element OR support multiple mount points

  const Placeholder = {
    init(element, context, { id }) {
      context.mounted({ id, element });
    },
    render(_, { id }) {
      return ["div", { "data-placeholder": id, __skip: true }];
    },
    release() {
      console.log("RELEASE!!");
    },
  };

  const transform_expression = expression =>
    expression.element === "placeholder"
      ? [Placeholder, { id: expression.attributes.id }]
      : [
          expression.element,
          expression.attributes || {},
          ...tx.map(
            expr =>
              typeof expr === "string" || typeof expr === "number"
                ? expr
                : transform_expression(expr),
            expression.children || []
          ),
        ];

  // May support span/keys as options
  const make_dom_process = (root, ___opts) => {
    const elements = new Map(); // mounted element, if any
    const templates = new Map(); // last-provided template (expression), if any
    const sources = new Map(); // pubsub subscriber for placeholder
    const feeds = new Map(); // placeholder content sink.  METASTREAM?

    const pluck_content = tx.pluck("content");
    const pubsub = rs.pubsub({ topic: _ => _.id });
    const ensure_source = id => {
      if (!sources.has(id))
        sources.set(
          id,
          // Don't tear down when removing last subscriber.
          // This is meant to survive even if element changes.
          pubsub.subscribeTopic(id, pluck_content, { closeOut: false })
        );
      return sources.get(id);
    };

    // Used by template/placeholder component
    const ctx = { mounted: _ => process.mounted.next(_) };

    const connect_if_mounted = id => {
      const element = id ? elements.get(id) : root;
      if (element && !feeds.has(id)) {
        // Automatically sends the latest value (if one arrived first)
        feeds.set(
          id,
          ensure_source(id)
            .transform(
              tx.map(transform_expression),
              th.updateDOM({ root: element, ctx, span: false, keys: false })
            )
            .subscribe({
              error(error) {
                console.error("UPDATE HDOM ERROR", error);
              },
            })
        );
      }
    };

    const process = {
      // stream where client writes content for placeholders
      content: rs.subscription({
        next(value) {
          const { id } = value;
          ensure_source(id);
          pubsub.next(value);
          connect_if_mounted(id);
        },
      }),
      // exposed so it can be monitored, but used internally
      mounted: rs.subscription({
        next({ id, element }) {
          // Unsubscribe feed if element is changing...
          // OR, maybe could use metastream
          const old_element = elements.get(id);
          if (old_element && old_element !== element) {
            console.log("ELEMENT IS CHANGING", old_element, element);
            const feed = feeds.get(id);
            if (feed) {
              console.log("Unsubscribing feed");
              feed.unsubscribe();
            }
          }
          elements.set(id, element);
          connect_if_mounted(id); // ??
        },
      }),
    };
    return process;
  };

  return { make_dom_process };
});
