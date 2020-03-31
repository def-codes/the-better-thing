(function () {
  const links = [...document.querySelectorAll(`link[rel="stylesheet"]`)];

  // By default, this inlines stylesheets in place of the import links, which is
  // preserves lexical order.  But when the document head and style blocks are
  // made visible, the inlined style definitions are quite in the way.  If an
  // `#inlined-styles` container is present, it will be used instead.  This may
  // break the original lexical ordering, but lets you control how the content
  // appears.
  const container = document.querySelector("#inlined-styles");
  for (const link of links) {
    const style = document.createElement("style");
    const css = [...link.sheet.cssRules].map(_ => _.cssText).join("\n");
    const text = document.createTextNode(css);
    style.appendChild(text);
    if (container) {
      container.appendChild(style);
      link.parentNode.removeChild(link);
    } else {
      // This was commented and replaced with below.  Seems to be working now.
      link.parentNode.replaceChild(style, link);
      // document.head.appendChild(style);
      // link.parentNode.removeChild(link);
    }
  }
})();
