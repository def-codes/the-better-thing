define(["@thi.ng/hiccup"], hiccup => {
  const make_download_link = () => [
    "ul",
    [
      "li",
      [
        "a",
        { "data-intent": "save-document", download: "doc.html" },
        "download document",
      ],
    ],
    [
      "li",
      [
        "a",
        { "data-intent": "save-scope", download: "scope.html" },
        "download this scope",
      ],
    ],
  ];

  const make_box_with_download_link = container => {
    container.innerHTML = hiccup.serialize(make_download_link());
  };

  const container = document.body.insertBefore(
    document.createElement("article"),
    document.body.firstChild
  );
  make_box_with_download_link(container);
});
