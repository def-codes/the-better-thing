// This is an earlier iteration of hdom-regions.
// It includes a custom hdom implementation that ended up not being used
// as well as some additional bookkeeping
// both of which might be necessary if you wanted to eliminate the placeholder element
// that the current version requires

define([
  "@thi.ng/rstream",
  "@thi.ng/transducers",
  "@thi.ng/associative",
  "@thi.ng/transducers-hdom",
], (rs, tx, { ArraySet }, th) => {
  // element is the instance key
  // custom impl is responsible for calling init,
  // but “parent” impl will call release
  // which means you must use lifecycle if you want to know when release happens

  // from @thi.ng/hdom dom implementation
  const maybeInitElement = (el, tree) =>
    tree.__init && tree.__init.apply(tree.__this, [el, ...tree.__args]);

  const custom = {
    normalizeTree(opts, tree) {
      // console.log(`NORMALIZE TREE`, tree);
      return tree;
    },
    createTree(opts, parent, tree, child, init) {
      console.log(`CREATE TREE`, { parent, tree, child, init });
      const element = document.createElement("blockquote");
      const [, attributes] = tree;
      const { id } = attributes;

      if (parent)
        if (child) parent.insertBefore(element, parent.children[child]);
        else parent.appendChild(element);
      if (init) maybeInitElement(element, tree);

      return element;
    },
    diffTree(opts, impl, parent, prev, curr, child) {
      console.log("DIFF", { prev_id, curr_id, child });

      // TODO: Why is this being called with `impl` as second argument?
      const prev_id = prev && prev[1] && prev[1].id;
      const curr_id = curr && curr[1] && curr[1].id;

      if (prev_id !== curr_id) {
        console.log(`People say you *changing*, placeholder`, prev_id, curr_id);
      } else if (prev_id === curr_id) {
        console.log(`Placeholder, you ain't changing`, curr_id);
      }
    },
    ...Object.fromEntries(
      [
        "hydrateTree",
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
        // return ["div", { __impl: custom, key: id, id }];
        return ["div", { key: id /*, id */ }];
      },
      release({ process: { unmounted } }, { id }) {
        // is id even needed?
        unmounted.next({ id, element: state.element });
        // console.log(`RELEASE!!`);
      },
    };
  };
  const OPTS = { closeOut: rs.CloseMode.NEVER };

  const transform_expression = (expression, p = new Set(), path = []) => {
    if (expression.element === "placeholder") {
      const { id } = expression.attributes;
      p.add({ id, path });
      // console.log(`placeholder`, id, path);
      // return ["div", { __impl: custom, key: id, id }];
      return [Template(), { id }];
    }

    return [
      expression.element,
      expression.attributes || {},
      ...tx.mapIndexed(
        (index, expr) =>
          typeof expr === "string" || typeof expr === "number"
            ? expr.toString()
            : transform_expression(expr, p, [...path, index]),
        expression.children || []
      ),
    ];
  };

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
                  tx.map(expr => {
                    // PROVISIONAL: this is not currently used
                    const things = new ArraySet();
                    const ret = transform_expression(expr, things);
                    // if (things.size) console.log(`encountered`, ...things);
                    return ret;
                  }),
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
