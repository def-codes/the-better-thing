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

require([], () => {
  // Distinguish standalone mode from hosted mode
  const is_file = window.location.protocol === "file:";
  if (!is_file) {
    // Do prep for going into standalone mode on save
    console.log(`hosted mode`);
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
