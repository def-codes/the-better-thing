require([], () => {
  const links = [...document.querySelectorAll(`link[rel="stylesheet"]`)];
  for (const link of links) {
    const style = document.createElement("style");
    const css = [...link.sheet.cssRules].map(_ => _.cssText).join("\n");
    const text = document.createTextNode(css);
    style.appendChild(text);
    // link.parentNode.replaceChild(style, link);
    document.head.appendChild(style);
    link.parentNode.removeChild(link);
  }
});
