define([
  "@thi.ng/rstream",
  "@thi.ng/transducers",
  "@thi.ng/hiccup",
  "@thi.ng/hdom",
  "@thi.ng/transducers-hdom",
], async (rs, tx, hiccup, hdom, th) => {
  const { scan } = tx;
  const { derefContext } = hiccup;
  const { DEFAULT_IMPL, resolveRoot } = hdom;

  const updateDOM = (child = 0, opts = {}, impl = DEFAULT_IMPL) => {
    const _opts = Object.assign({ root: "app" }, opts);
    const root = resolveRoot(_opts.root, impl);
    return scan([
      () => [],
      acc => acc,
      (prev, curr) => {
        _opts.ctx = derefContext(opts.ctx, _opts.autoDerefKeys);
        curr = impl.normalizeTree(_opts, curr);
        if (curr != null) {
          if (_opts.hydrate) {
            impl.hydrateTree(_opts, root, curr);
            _opts.hydrate = false;
          } else {
            impl.diffTree(_opts, root, prev, curr, child);
          }
          return curr;
        }
        return prev;
      },
    ]);
  };

  const root = document.querySelector("#plain-transducers-hdom-test");
  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
  const idx = [...root.parentNode.childNodes].indexOf(root) - 1;

  const custom = {
    /**
     * Normalizes given hdom tree, expands Emmet-style tags, embedded
     * iterables, component functions, component objects with life cycle
     * methods and injects `key` attributes for `diffTree()` to later
     * identify changes in nesting order. During normalization any
     * embedded component functions are called with the given (optional)
     * user `ctx` object as first argument. For further details of the
     * default implementation, please see `normalizeTree()` in
     * `normalize.ts`.
     *
     * Implementations MUST check for the presence of the `__impl`
     * control attribute on each branch. If given, the current
     * implementation MUST delegate to the `normalizeTree()` method of
     * the specified implementation and not descent into that branch
     * further itself.
     *
     * Furthermore, if (and only if) an element has the `__normalize`
     * control attrib set to `false`, the normalization of that
     * element's children MUST be skipped.
     *
     * Calling this function is a prerequisite before passing a
     * component tree to `diffTree()`. Recursively expands given hiccup
     * component tree into its canonical form:
     *
     * ```
     * ["tag", { attribs }, ...body]
     * ```
     *
     * - resolves Emmet-style tags (e.g. from `div#id.foo.bar`)
     * - adds missing attribute objects (and `key` attribs)
     * - merges Emmet-style classes with additional `class` attrib
     *   values (if given), e.g. `["div.foo", { class: "bar" }]` =>
     *   `["div", {class: "bar foo" }]`
     * - evaluates embedded functions and replaces them with their
     *   result
     * - calls the `render` life cycle method on component objects and
     *   uses result
     * - consumes iterables and normalizes their individual values
     * - calls `deref()` on elements implementing the `IDeref` interface
     *   and uses returned results
     * - calls `toHiccup()` on elements implementing the `IToHiccup`
     *   interface and uses returned results
     * - calls `.toString()` on any other non-component value and by
     *   default wraps it in `["span", x]`. The only exceptions to this
     *   are: `button`, `option`, `textarea` and SVG `text` elements,
     *   for which spans are never created.
     *
     * Additionally, unless the `keys` option is explicitly set to
     * false, an unique `key` attribute is created for each node in the
     * tree. This attribute is used by `diffTree` to determine if a
     * changed node can be patched or will need to be moved, replaced or
     * removed.
     *
     * In terms of life cycle methods: `render` should ALWAYS return an
     * array or another function, else the component's `init` or
     * `release` fns will NOT be able to be called. E.g. If the return
     * value of `render` evaluates as a string or number, it should be
     * wrapped as `["span", "foo"]` or an equivalent wrapper node. If no
     * `init` or `release` methods are used, this requirement is
     * relaxed.
     *
     * See `normalizeElement` (normalize.ts) for further details about
     * the canonical element form.
     *
     * @param tree - component tree
     * @param opts - hdom config options
     */
    normalizeTree(opts, tree) {
      // console.log(`NORMALIZE TREE`, tree);
      return tree;
      // return DEFAULT_IMPL.normalizeTree(opts, tree);
    },
    /**
     * Realizes the given hdom tree in the target below the `parent`
     * node, e.g. in the case of the browser DOM, creates all required
     * DOM elements encoded by the given hdom tree.
     *
     * @remarks
     * If `parent` is null the result tree won't be attached to any
     * parent. If `child` is given, the new elements will be inserted at
     * given child index.
     *
     * For any components with `init` life cycle methods, the
     * implementation MUST call `init` with the created element, the
     * user provided context (obtained from `opts`) and any other args.
     * `createTree()` returns the created root element(s) - usually only
     * a single one, but can be an array of elements, if the provided
     * tree is an iterable of multiple roots. The default implementation
     * creates text nodes for non-component values. Returns `parent` if
     * tree is `null` or `undefined`.
     *
     * Implementations MUST check for the presence of the `__impl`
     * control attribute on each branch. If given, the current
     * implementation MUST delegate to the `createTree()` method of the
     * specified implementation and not descent into that branch further
     * itself.
     *
     * @param parent - parent node in target (e.g. DOM element)
     * @param tree - component tree
     * @param child - child index
     * @param init - true, if {@link ILifecycle.init} methods are called
     */
    createTree(opts, parent, tree, child, init) {
      console.log(`CREATE TREE`, { parent, tree, child, init });
      const ele = document.createElement("blockquote");
      if (parent)
        if (child) parent.insertBefore(ele, parent.children[child]);
        else parent.appendChild(ele);

      return ele;
    },
    /**
     * Takes a target root element and normalized hdom tree, then walks
     * tree and initializes any event listeners and components with life
     * cycle `init` methods. Assumes that an equivalent "DOM" (minus
     * listeners) already exists when this function is called. Any other
     * discrepancies between the pre-existing DOM and the hdom tree
     * might cause undefined behavior.
     *
     * Implementations MUST check for the presence of the `__impl`
     * control attribute on each branch. If given, the current
     * implementation MUST delegate to the `hydrateTree()` method of the
     * specified implementation and not descent into that branch further
     * itself.
     *
     * @param opts - hdom config options
     * @param parent - parent node in target (e.g. DOM element)
     * @param tree - component tree
     * @param child - child index
     */
    hydrateTree(opts, parent, tree, child) {
      console.log(`NOT IMPLEMENTED! HYDRATE TREE`, opts, parent, tree, child);
    },
    /**
     * Takes an `HDOMOpts` options object, a `parent` element and two
     * normalized hiccup trees, `prev` and `curr`. Recursively computes
     * diff between both trees and applies any necessary changes to
     * reflect `curr` tree, based on the differences to `prev`, in
     * target (browser DOM when using the `DEFAULT_IMPL`
     * implementation).
     *
     * All target modification operations are delegated to the given
     * implementation. `diffTree()` merely manages which elements or
     * attributes need to be created, updated or removed and this NEVER
     * involves any form of tracking of the actual underlying target
     * data structure (e.g. the real browser DOM). hdom in general and
     * `diffTree()` specifically are stateless. The only state available
     * is implicitly defined by the two trees given (prev / curr).
     *
     * Implementations MUST check for the presence of the `__impl`
     * control attribute on each branch. If present AND different than
     * the current implementation, the latter MUST delegate to the
     * `diffTree()` method of the specified implementation and not
     * descent into that branch further itself.
     *
     * Furthermore, if (and only if) an element has the `__diff` control
     * attribute set to `false`, then:
     *
     * 1) Computing the difference between old & new branch MUST be
     *    skipped
     * 2) The implementation MUST recursively call any `release` life
     *    cycle methods present anywhere in the current `prev` tree
     *    (branch). The recursive release process itself is implemented
     *    by the exported `releaseDeep()` function in `diff.ts`. Custom
     *    implementations are encouraged to reuse this, since that
     *    function also takes care of handling the `__release` attrib:
     *    if the attrib is present and set to false, `releaseDeep()`
     *    will not descend into the branch any further.
     * 3) Call the current implementation's `replaceChild()` method to
     *    replace the old element / branch with the new one.
     *
     * @param opts - hdom config options
     * @param parent - parent node in target (e.g. DOM element)
     * @param prev - previous component tree
     * @param curr - current component tree
     * @param child - child index
     */
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
      // console.log(`NOT IMPLEMENTED! DIFF TREE`, { parent, prev, curr, child });
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

  rs.fromInterval(1000).subscribe(
    {
      error(error) {
        console.error("FLOOBAR", error);
      },
    },
    tx.comp(
      // tx.trace("111111111111111111"),
      // Findings:
      // - crash when span is false and keys is true
      // - no update when span is false and keys is false AND
      //   - more than one text element

      // tx.map(_ => ["output", {}, ["i", "my value is"], ["b", {}, _]]),
      // tx.map(_ => ["output", {}, "my value is", _]),
      // tx.map(_ => ["output", { }, `my value is ${_}`]),
      tx.map(_ => [
        "output",
        {},
        ...(true || _ % 4
          ? [
              _ % 3
                ? ["b", { key: "0", __impl: custom, id: "war" }]
                : ["b", { key: "0", __impl: custom, id: "peace" }],
              ["span", { key: "1" }, `my unquad value was ${_ || "nullish"}`],
            ]
          : [
              ["span", { key: "2" }, `my even value is ${_}`],
              [
                _ < 3 ? "div" : "span",
                { key: "3", __impl: custom, id: "testing" },
              ],
            ]
        ).filter(_ => !!_),
      ]),
      // tx.trace("222222222222"),
      // updateDOM(idx, { root: root.parentNode })
      // updateDOM(0, { root })
      th.updateDOM({ root })
      // tx.trace("3333333333333333333333")
    )
  );
});
