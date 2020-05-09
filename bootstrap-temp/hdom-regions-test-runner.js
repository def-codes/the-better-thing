// define(["@def.codes/hdom-regions"], ({ make_dom_process }) => {
define(["./hdom-regions"], ({ make_dom_process }) => {
  const run_test_case = (test_case, root) => {
    const streams = test_case();
    const element = root.appendChild(document.createElement("article"));
    // region coordinator, whatever
    const dom_process = make_dom_process();
    dom_process.mounted.next({ id: "root", element });
    for (const [id, stream] of Object.entries(streams))
      stream.subscribe({
        next: content => {
          console.log(`content`, id, content);

          dom_process.content.next({ id, content });
        },
      });
  };

  return { run_test_case };
});
