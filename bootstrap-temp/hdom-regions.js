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

  const TEMPLATE_PROTOTYPE = {
    init(element, context, args) {
      const { id } = args;
      const { process } = context;
      console.log(`INIT!!`, { element, context, args });
      if (id) process.mounted.next({ id, element });
    },
    render(_ctx, { id }) {
      return ["div", { __impl: custom, key: id, id }];
    },
    release({ process: { unmounted } }, { id }) {
      unmounted.next("umm.... what?");
      console.log(`RELEASE!!`);
    },
  };

  const OPTS = { closeOut: false };
  const P = Object.getPrototypeOf;
  const is_plain_object = x => x && P(P(x)) === null;
  const transform_expression = (
    [element, ...rest],
    p = new Set(),
    path = []
  ) => {
    const [second, ...tail] = rest;
    const n = is_plain_object(second);
    const attributes = n ? second : {};
    const children = n ? tail : rest;
    if (element === "placeholder") {
      const { id } = attributes;
      p.add({ id, path });
      console.log(`placeholder`, id, path);
      // return ["div", { __impl: custom, key: id, id }];
      return [TEMPLATE_PROTOTYPE, { id }];
    }

    return [
      element,
      attributes || {},
      ...(children || []).map((expr, index) =>
        typeof expr === "string" || typeof expr === "number"
          ? expr.toString()
          : transform_expression(expr, p, [...path, index])
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
            console.log("MAKING FEED FOR", id, element);
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

    Object.assign(process, {
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
        next(message) {
          console.log(`UNMOUNTED!!??`, message);
        },
      }),
    });
    return process;
  };
  return { make_dom_process };
});
