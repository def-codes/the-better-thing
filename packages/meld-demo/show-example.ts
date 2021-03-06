import * as tx from "@thi.ng/transducers";
import * as rs from "@thi.ng/rstream";
import { renderOnce } from "@thi.ng/hdom";
import { updateDOM } from "@thi.ng/transducers-hdom";
import { render, monotonic_world, render_triples } from "@def.codes/meld-core";
import { MIND_MAP } from "./mind-map";

const render_example = example => [
  "article.example",
  { id: example.id },
  [
    "div.description",
    [
      "header",
      [
        "h3.heading",
        ["a.example-link", { href: `#${example.id}` }, example.label],
      ],
      ["p.comment", example.comment],
    ],
    [
      "div.userland-code",
      [
        "code.userland-code-input",
        { contenteditable: true, spellcheck: false },
        example.userland_code,
      ],
      ["div.userland-code-output"],
      ["div.host-output"],
      ["div.host-output-ports"],
    ],
  ],
  [
    "figure.representation",
    ["div.Document", { "data-model-representation": example.id }],
  ],
];

export function show_example(model_id) {
  if (!model_id) return;
  // @ts-ignore
  const model_spec = MIND_MAP["@graph"].find(_ => _.id === model_id);
  if (!model_spec) {
    console.warn(`No such model: ${model_id}`);
    renderOnce(["p", `No such model: ${model_id}`], { root: "model" });
    return;
  }

  renderOnce(render_example(model_spec), { root: "model" });

  // Pull dom nodes from the rendered result.
  // The highest-level (probably empty) node available to the app.
  // @ts-ignore
  const dom_root = document.getElementById(model_spec.id);
  const representation_container = dom_root.querySelector(
    "[data-model-representation]"
  );
  const output_container = dom_root.querySelector(".userland-code-output");
  const host_output_container = dom_root.querySelector(".host-output");
  const ports_container = dom_root.querySelector(".host-output-ports");

  //=================================== MESSAGES
  // Need a go-to stream error handler for now. identify message and source
  // actually, subscription can have id... how to make this available?

  const messages = rs.subscription<
    any,
    { type: "error"; source: string; error }
  >();
  const catchall = source => ({
    error: error => messages.next({ type: "error", source, error }),
  });
  // do something with messages
  messages
    .transform(
      tx.filter(_ => _.type === "error"),
      tx.sideEffect(console.error)
    )
    .subscribe(catchall("message-display"));

  //================================== HOST DATAFLOW INTEROP
  // under construction
  const ports = (function () {
    let container_registry: Record<
      string,
      { sub: rs.Subscription<any, any>; ele: Element }
    > = {};

    const ensure_port_container = name => {
      let ele = ports_container.querySelector(`[data-port="${name}"]`);
      if (!ele) {
        ele = ports_container.appendChild(document.createElement("div"));
        ele.setAttribute("data-port", name);
      }
      return ele;
    };

    const input_added = rs.subscription();

    return {
      cleanup() {
        for (const { sub, ele } of Object.values(container_registry)) {
          sub.unsubscribe();
          ele.parentNode.removeChild(ele);
        }
        container_registry = {};
        // Host inputs don't belong to you, so don't close them here.
      },
      input_added,
      add_input(name: string, stream: rs.IStream<any>) {
        input_added.next({ name, stream });
      },
      add_output(name, sub) {
        const ele = ensure_port_container(name);
        container_registry[name] = {
          ele,
          sub: sub
            .transform(
              tx.map(value => [
                "article.port-output",
                ["h3", name],
                ["div.value-view", [render, { value }]],
              ]),
              updateDOM({ root: ele, ctx: { render } })
            )
            .subscribe(catchall(`host output port display for “${name}”`)),
        };
      },
    };
  })();

  //================================== USERLAND CODE
  // outside the scope of the model as such

  const { interpret, facts } = monotonic_world({
    // @ts-ignore
    id: model_spec.id,
    dom_root: representation_container,
    ports,
  });

  ports.add_input(
    "test",
    rs.fromIterable(
      tx.cycle("red orange yellow green blue indigo violet".split(" ")),
      { delay: 500 }
    )
  );

  // DATAFY EVENT!
  ports.add_input("visits", rs.fromEvent(window, "onhashchange"));

  facts
    .transform(
      // HACK: see
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
          result.error.lineNumber,
        ]
      : ["result.okay"];

  const results = rs.subscription<any, { when: string; error: any }>();
  results
    .transform(tx.map(render_result), updateDOM({ root: output_container }))
    .subscribe(catchall("host-result-render"));
  // TODO: add stack trace in custom error reporting & remove this
  results.transform(
    tx.filter(_ => _.when === "creating-system"),
    tx.pluck("error"),
    tx.keep(),
    //tx.sideEffect(console.orig.error)
    tx.sideEffect(console.error)
  );

  const sink = userland_code => results.next(interpret(userland_code));

  const code_input = dom_root.querySelector(".userland-code-input");

  // update USERLAND CODE when the user makes edits
  rs.fromEvent(code_input, "input")
    .transform(
      tx.throttleTime(1000),
      tx.map(
        event => event.target instanceof HTMLElement && event.target.innerText
      ),
      tx.keep(),
      tx.sideEffect(sink)
    )
    .subscribe(catchall("userland-code-processor"));

  // Send initial USERLAND CODE now
  // @ts-ignore
  if (model_spec.userland_code) sink(model_spec.userland_code);
}
