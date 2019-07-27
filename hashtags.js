// And now for something completely different
requirejs(
  ["@thi.ng/transducers", "@thi.ng/hdom", "@thi.ng/hiccup-markdown"],
  (tx, hdom, md) => {
    (async function() {
      const response = await fetch("/src/meld-demo/hashtags.md");
      const text = await response.text();
      hdom.renderOnce(["div", {}, tx.iterator(md.parse(), text)], {
        root: "hashtags",
        span: true,
      });
    })();
  }
);
