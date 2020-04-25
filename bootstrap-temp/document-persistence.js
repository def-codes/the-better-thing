define("@def-codes/meld/document-persistence", [], () => {
  // This only works if the link had its `download` property set.
  function snapshot_and_prompt_download(event) {
    // Here we are handling a click on a link.  `this` refers to the link
    // object.

    // Save works by embedding the document's content in this link's
    // destination.  Each time the link is clicked, its target will be set to
    // the document's content at that time.  In case this link still contains
    // content from an earlier click, we clear it out now so that it isn't
    // (redundantly) included with the new serialized content.  In other words,
    // don't write a document that includes an earlier copy of itself embedded
    // in a link.
    this.href = "";

    // Now get the HTML text of the document.
    const html = document.documentElement.outerHTML;

    // Put the HTML text into the link's target as a “data URL.”
    // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
    this.href = `data:text/html;charset=utf-8, ${encodeURIComponent(html)}`;
  }

  const handle_save_document = event => {
    if (event.target.matches(`a[data-intent="save-document"]`))
      snapshot_and_prompt_download.apply(event.target);
  };

  // A side-effecting function
  function wire_save_links() {
    document.body.addEventListener("click", handle_save_document);
  }

  return { wire_save_links };
});
