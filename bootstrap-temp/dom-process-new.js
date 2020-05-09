// dom process take 2. TODO: move this to package
//
// NOTE: expects you to provide your own spans and keys
/*

  When content arrives (for a given placeholder),

  - cache the definition
  - if there is a template that contains a placeholder for this id
    - and it has not been mounted
      - then re-render the containing template
        - and mount the element
        - and inform hdom to skip that subtree
  - if there is an element mounted for this id, send the updated content to it

 */
define(["@thi.ng/rstream", "@thi.ng/transducers", "@thi.ng/transducers-hdom"], (
  rs,
  tx,
  th
) => {
  // NO: nix this
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

  // args: {expression}
  const Template = () => {
    const stateful_mapping = id => {
      const state = {};

      return expression => {
        const placeholders = new Set();
        const template = transform_expression(expression, placeholders);
        if (placeholders.size)
          console.log(
            "YOU GOT PLACEHOLDERS",
            expression,
            template,
            placeholders
          );
        // but there's more to it, you have to remove if it was there before, etc
        for (const p of placeholders) inverse_tree.get(p).add(id);
        tree.set(id, placeholders);
        // If this is the “first time” through, you can't issue any "skip"s
        // but you always need to issue skip when a placeholder is defined
        // it's not this node's responsibility to render that placeholder's content
        // but it is this node's responsibility to get the element
        return template;
      };
    };

    return {
      init(element, context, args) {},
      render(context, args) {},
      release() {},
    };
  };

  const transform_expression = (expression, p) =>
    expression.element === "placeholder"
      ? (p.add(expression.attributes.id),
        [Placeholder, { id: expression.attributes.id }])
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

  // Placeholder id to a set of placeholder id's referenced by the last defined template
  const tree = new Map();
  const inverse_tree = new Map(); // what we actually need

  // May support span/keys as options
  // NO: going to require normalized trees
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
              // tx.map(transform_expression),
              tx.map(stateful_mapping(id)),
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
      // This should be called `define`? (and placeholder is `require`? except it doesn't)
      //
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
