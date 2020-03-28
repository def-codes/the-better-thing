// And now for something completely different
requirejs(
  ["@thi.ng/transducers", "@thi.ng/hdom", "@thi.ng/hiccup-markdown"],
  (tx, hdom, md) => {
    (async function() {
      // Doesn't matter, you can't load this from a local file, it's considered CORS
      const base = window.location.href.replace(/\/[^/]+\.html$/, "");
      const response = await fetch(`${base}/packages/meld-demo/hashtags.md`);
      const text = await response.text();
      hdom.renderOnce(["div", {}, tx.iterator(md.parse(), text)], {
        root: "hashtags",
        span: true,
      });
    })();
  }
);
