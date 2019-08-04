// Inine all external scripts and stylesheets
//
// For saving:
// - will need to provide a special download facility (link blob, etc)
//
// For styles, you can recover the text (unlike script, from what I see so far),
// but the default built-in save won't respect changes of this kind.  That is,
// it'll save the page with the links that were there when originally loaded,
// not whatever's there now.  Apparently FF “used to” do this.  Edge, funny
// story, doesn't seem to have a “Save page” option at all.  (Of course, the
// styles don't work, either.)

// In hosted mode:
// - can fetch scripts and embed them
//
// In standalone mode:
// - need to inline and shim an AMD loader *beforehand*
//
require([], () => {
  const scripts = document.querySelectorAll("script[src]");
  for (const script of scripts) {
    // console.log("script", script);
    // console.log("text", script.innerText);
    // console.log("html", script.innerHTML);
  }
  window.scripts = scripts;

  // const links = document.querySelectorAll(`link[rel="stylesheet"]`);
  // for (const link of links) {
  //   const style = document.createElement("style");
  //   const css = [...link.sheet.cssRules].map(_ => _.cssText).join("\n");
  //   const text = document.createTextNode(css);
  //   style.appendChild(text);
  //   link.parentNode.replaceChild(style, link);
  // }

  //window.links = links;
});
