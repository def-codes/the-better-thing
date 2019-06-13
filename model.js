function main() {
  const { transducers: tx, rstream: rs, hdom } = thi.ng;

  const requested_model = window.location.search.replace(/^\?/, "");
  if (!requested_model) return;
  const model_spec = MELD_EXAMPLES.find(_ => _.name === requested_model);
  if (!model_spec) {
    console.warn(`No such model: ${requested_model}`);
    return;
  }

  hdom.renderOnce(render_example(model_spec), { root: "model" });

  make_model_dataflow(model_spec);
}

main();
