console.log(`asdfhasd`);

// And now for something completely different
requirejs(
  ["@thi.ng/transducers", "@thi.ng/hdom", "@thi.ng/hiccup-markdown"],
  async (tx, hdom, md) => {
    console.log(`line 44`);
    console.orig.log(`line 161`);

    const response = await fetch("/src/meld-demo/hashtags.md");
    console.orig.log(`response`, response);

    const text = await response.text();
    console.orig.log(`text`, text);

    hdom.renderOnce([...tx.iterator(md.parse(text))], { root: "hashtags" });
  }
);
