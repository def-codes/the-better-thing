// Testing dom process usage
define(["./hdom-regions.js", "@thi.ng/rstream", "@thi.ng/transducers"], async (
  dp,
  rs,
  tx
) => {
  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

  const root = document.querySelector("#dom-process-test");
  const dom_process = dp.make_dom_process(root);
  dom_process.mounted.next({ id: "", element: root });
  // dom_process.mounted.subscribe(rs.trace("MOUNTED"));
  // dom_process.content.subscribe(rs.trace("CONTENT"));
  dom_process.define("def:root/never", {
    element: "p",
    children: ["Never seen because placeholder never placed"],
  });
  rs.fromInterval(250).subscribe(
    dom_process.ports.get("def:some-value"),
    tx.map(value => ({
      element: "output",
      children: [
        { element: "i", children: ["my value is"] },
        { element: "b", children: [value] },
      ],
    }))
  );

  dom_process.define("", {
    element: "div",
    attributes: {},
    children: [
      {
        element: "header",
        children: [{ element: "h1", children: ["in the beginning"] }],
      },
      { element: "placeholder", attributes: { id: "def:some-value" } },
      { element: "placeholder", attributes: { id: "def:root/bananas" } },
      {
        element: "footer",
        children: [{ element: "q", children: ["and in the end"] }],
      },
    ],
  });
  dom_process.define("def:root/bananas", {
    element: "p",
    attributes: { resource: "http:brainstorms" },
    children: [
      { element: "span", children: ["I "] },
      { element: "i", children: ["loves"] },
      { element: "span", children: [" you, Porgy"] },
    ],
  });
  await timeout(7000);
  dom_process.define("def:root/bananas", {
    element: "p",
    attributes: { resource: "http:brainstorms" },
    children: [
      { element: "span", children: ["I "] },
      { element: "i", children: ["loves"] },
      { element: "span", children: [" you, Bess"] },
    ],
  });
  await timeout(7000);
  dom_process.define("def:root/bananas", {
    element: "p",
    attributes: { resource: "http:brainstorms" },
    children: [
      { element: "span", children: ["I "] },
      { element: "i", children: ["loves"] },
      { element: "span", children: [" you, Potato"] },
    ],
  });
});
