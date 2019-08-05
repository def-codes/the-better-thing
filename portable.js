// You *cannot*(AFAIK) get the content of external scripts via the DOM.
// If you could, then this would be possible* in local mode.
//
// *But it's moot in the general case, because of module dependencies
async function inline_external_scripts() {
  // Materialize because this is a live collection and we're mutating doc.
  for (const script of [...document.querySelectorAll("script[src]")]) {
    const inlined = document.createElement("script");
    inlined.innerHTML = await (await fetch(script.src)).text();
    // Adding this to the doc will cause it to execute again.
    // This should only be used for AMD loader itself
    script.parentNode.replaceChild(inlined, script);
  }
}

function fsdopfsdf() {
  // script here will run on startup

  // Ultimately, want to register pre-save actions here
  // But we don't have protocol (without loading a package!)

  // Minimal escaping, mainly in case of a literal textarea closing tag
  // This is inefficient and not suitable for large inputs
  const encode_html = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  // Textarea content doesn't track its value.  But the content,
  // not the value, is what gets serialized.
  function set_textarea_content() {
    for (const textarea of document.querySelectorAll("textarea")) {
      textarea.innerHTML = encode_html(textarea.value);
    }
  }

  function create_save_link(filename = "index.html") {
    const link = document.createElement("a");
    link.download = filename;
    link.href = "#";
    link.setAttribute("contenteditable", "false");
    link.setAttribute("data-intent", "save-document");
    link.addEventListener("click", snapshot_and_prompt_download);
    link.innerHTML = "save";
    return link;
  }

  // This is how the save header got added to the document.
  function add_save_area() {
    const header = document.createElement("header");
    header.appendChild(create_save_link("mindbug.html"));
    const main = document.querySelector("main");
    main.insertBefore(header, main.firstChild);
  }
}

function morstyf() {
  // const links = document.querySelectorAll(`link[rel="stylesheet"]`);
  // for (const link of links) {
  //   const style = document.createElement("style");
  //   const css = [...link.sheet.cssRules].map(_ => _.cssText).join("\n");
  //   const text = document.createTextNode(css);
  //   style.appendChild(text);
  //   link.parentNode.replaceChild(style, link);
  // }
  //window.links = links;
}
function snapshot_and_prompt_download_wait() {
  this.href = ""; // don't serialize any previous content in href
  const html = document.documentElement.outerHTML;
  const type = "text/html";
  var url = window.URL.createObjectURL(new Blob([html], { type }));

  this.href = `data:text/html;charset=utf-8, ${encodeURIComponent(html)}`;
  // When would we do this?
  // window.URL.revokeObjectURL(link.href);
}

// This module should have no dependencies
// I'm not even sure it should be a module
// It's supposed to persist itself
require([], () => {
  // Distinguish standalone mode from hosted mode
  const is_file = window.location.protocol === "file:";
  if (!is_file) {
    // Do prep for going into standalone mode on save
    console.log(`hosted mode`);
    inline_external_scripts();
  }

  // General standalone mode support
  (function() {
    // This only works if the link had its `download` property set.
    function snapshot_and_prompt_download() {
      // should be a hook
      // set_textarea_content();
      this.href = ""; // don't serialize any previous content in href
      const html = document.documentElement.outerHTML;
      this.href = `data:text/html;charset=utf-8, ${encodeURIComponent(html)}`;
    }

    function wire_save_links() {
      for (const link of document.querySelectorAll(
        '[data-intent="save-document"]'
      ))
        link.addEventListener("click", snapshot_and_prompt_download);
      // Create one if there isn't one?
    }

    wire_save_links();
  })();

  (function() {
    // Given a link element pointing to an external stylesheet, return a style
    // element with equivalent content.
    function inline_stylesheet(link) {
      const style = document.createElement("style");
      const css = [...link.sheet.cssRules].map(_ => _.cssText).join("\n");
      const text = document.createTextNode(css);
      style.appendChild(text);
      return style;
    }

    function inline_linked_stylesheets() {
      const links = [...document.querySelectorAll(`link[rel="stylesheet"]`)];
      for (const link of links) {
        // const style = document.createElement("style");
        // const css = [...link.sheet.cssRules].map(_ => _.cssText).join("\n");
        // const text = document.createTextNode(css);
        // style.appendChild(text);
        // link.parentNode.replaceChild(style, link);
        const style = inline_stylesheet(link);
        document.head.appendChild(style);
        link.parentNode.removeChild(link);
      }
    }

    inline_linked_stylesheets();
  })();
});
