(function model_main() {
  const { transducers: tx, rstream: rs, hdom } = thi.ng;
  const { rdf_hdom, value_view, meld_world } = window;
  const { render_triples } = rdf_hdom;
  const { render } = value_view;
  const { monotonic_world } = meld_world;

  //=========== LOAD MODEL

  const requested_model = window.location.search.replace(/^\?/, "");
  if (!requested_model) return;
  const model_spec = MELD_EXAMPLES.find(_ => _.name === requested_model);
  if (!model_spec) {
    console.warn(`No such model: ${requested_model}`);
    return;
  }

  const render_example = example => [
    "article.example",
    { id: example.name },
    [
      "div.description",
      [
        "header",
        [
          "h3.heading",
          ["a.example-link", { href: `#${example.name}` }, example.label]
        ],
        ["p.comment", example.comment]
      ],
      [
        "div.userland-code",
        [
          "code.userland-code-input",
          { contenteditable: true, spellcheck: false },
          example.userland_code
        ],
        ["div.userland-code-output"],
        ["div.host-output"],
        ["div.host-output-ports"]
      ]
    ],
    [
      "figure.representation",
      ["div.Document", { "data-model-representation": example.name }]
    ]
  ];

  hdom.renderOnce(render_example(model_spec), { root: "model" });

  // Pull dom nodes from the rendered result.
  // The highest-level (probably empty) node available to the app.
  const dom_root = document.getElementById(model_spec.name);
  const representation_container = dom_root.querySelector(
    "[data-model-representation]"
  );
  const output_container = dom_root.querySelector(".userland-code-output");
  const host_output_container = dom_root.querySelector(".host-output");
  const ports_container = dom_root.querySelector(".host-output-ports");

  //=================================== MESSAGES
  // Need a go-to stream error handler for now. identify message and source
  // actually, subscription can have id... how to make this available?

  const messages = rs.subscription();
  const catchall = source => ({
    error: error => messages.next({ type: "error", source, error })
  });
  // do something with messages
  messages
    .transform(tx.filter(_ => _.type === "error"), tx.sideEffect(console.error))
    .subscribe(catchall("message-display"));

  //================================== HOST DATAFLOW INTEROP
  // under construction
  const ports = (function() {
    let registry = {};

    const ensure_port_container = name => {
      let ele = ports_container.querySelector(`[data-port="${name}"]`);
      if (!ele) {
        ele = ports_container.appendChild(document.createElement("div"));
        ele.setAttribute("data-port", name);
      }
      return ele;
    };

    return {
      cleanup() {
        for (const { sub, ele } of Object.values(registry)) {
          sub.unsubscribe();
          ele.parentNode.removeChild(ele);
        }
        registry = {};
      },
      add(name, sub) {
        const ele = ensure_port_container(name);
        registry[name] = {
          ele,
          sub: sub
            .transform(
              tx.map(value => [
                "article.port-output",
                ["h3", name],
                ["div.value-view", [render, { value }]]
              ]),
              updateDOM({ root: ele, ctx: { render } })
            )
            .subscribe(catchall(`host output port display for “${name}”`))
        };
      }
    };
  })();

  //================================== USERLAND CODE
  // outside the scope of the model as such

  const { interpret, facts } = monotonic_world({
    id: model_spec.name,
    dom_root: representation_container,
    ports
  });

  const { updateDOM } = thi.ng.transducersHdom;

  facts
    .transform(
      tx.map(triples => [render_triples, { value: triples }]),
      updateDOM({ root: host_output_container, ctx: { render } })
    )
    .subscribe(catchall("host-triple-renderer"));

  const render_result = result =>
    result.error
      ? [
          "result.error",
          { "data-when": result.when },
          result.error,
          " line ",
          result.error.lineNumber
        ]
      : ["result.okay"];

  const results = rs.subscription();
  results
    .transform(tx.map(render_result), updateDOM({ root: output_container }))
    .subscribe(catchall("host-result-render"));
  // TODO: add stack trace in custom error reporting & remove this
  results.transform(
    tx.filter(_ => _.when === "creating-system"),
    tx.pluck("error"),
    tx.keep(),
    tx.sideEffect(console.orig.error)
  );

  const sink = userland_code => results.next(interpret(userland_code));

  const code_input = dom_root.querySelector(".userland-code-input");

  // update USERLAND CODE when the user makes edits
  rs.fromEvent(code_input, "input")
    .transform(
      tx.throttleTime(1000),
      tx.map(event => event.target.innerText),
      tx.sideEffect(sink)
    )
    .subscribe(catchall("userland-code-processor"));

  // Send initial USERLAND CODE now
  if (model_spec.userland_code) sink(model_spec.userland_code);
})();
