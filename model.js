(function model_main() {
  const { transducers: tx, rstream: rs, hdom } = thi.ng;

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
          "textarea.userland-code-input",
          { spellcheck: false },
          example.userland_code
        ],
        ["div.userland-code-output"]
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

  //================================== USERLAND CODE
  // outside the scope of the model as such

  const interpret = monotonic_world({ id: model_spec.name, dom_root });

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

  const { updateDOM } = thi.ng.transducersHdom;
  const results = rs
    .subscription()
    .transform(tx.map(render_result), updateDOM({ root: output_container }));

  const sink = userland_code => results.next(interpret(userland_code));

  const code_input = dom_root.querySelector(".userland-code-input");

  // update USERLAND CODE when the user makes edits
  rs.fromEvent(code_input, "input").transform(
    tx.throttleTime(1000),
    tx.map(event => event.target.value),
    tx.sideEffect(sink)
  );

  // Send initial USERLAND CODE now
  if (model_spec.userland_code) sink(model_spec.userland_code);
})();
