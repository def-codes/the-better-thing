// Alternate, hijacked console implementation.
// CONSOLE IS DEAD LONG LIVE CONSOLE
(function() {
  const { rstream: rs, transducers: tx } = thi.ng;
  const { updateDOM } = thi.ng.transducersHdom;
  const { value_view } = window;
  const { render, render_value } = value_view;

  const container = document.body.appendChild(document.createElement("div"));

  const render_entry = (_, { method, args }) => [
    "div.console-entry",
    { "data-method": method },
    tx.map(render_value, args)
  ];

  const render_entries = (_, entries) => [
    "div.console",
    tx.map(entry => [render_entry, entry], entries)
  ];

  const orig = {};
  Object.assign(console, { orig }); // escape hatch

  const sub = rs.subscription(
    {
      error(error) {
        alert("see console, sheep");
        orig.error("Alt log failed", error);
      }
    },
    tx.comp(
      tx.slidingWindow(10),
      tx.map(entries => [render_entries, entries]),
      updateDOM({ root: container, ctx: { render } })
    )
  );

  for (const method of ["log", "warn", "error"]) {
    orig[method] = console[method];
    try {
      console[method] = function(...args) {
        sub.next({ method, args });
        if (method === "error") orig.error(...args);
      };
    } catch (error) {
      orig.log("ERROR: ", error);
      throw error;
    }
  }
})();
