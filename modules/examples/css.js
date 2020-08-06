define([], () => {
  // All the stuff that's defined in the CSS files
  // Particularly the custom vars
  //
  // The CSS model doesn't retain comments or allow any other kind of extension.
  // But you can convert those global rules to data and annotate them
  //
  // This model ignores lexical order. We must often be agnostic about it
  // anyway.
  //
  // Corresponding thing: datafy/nav of the document's style definitions

  for (const stylesheet of document.styleSheets) {
  }

  return {
    "@context": {
      // Regarding CSS itself, see also
      // https://developer.mozilla.org/en-US/docs/Web/CSS
      css: "https://www.w3.org/Style/CSS/",
    },
    "css:Selector": {
      comment: "an expression describing a kind of tree traversal",
    },
    "css:Property": {
      comment:
        "talking about the property itself (like, background-color), not a usage of it",
    },
    "css:value": { "rdfs:subpropertyOf": "rdf:value" },
    //  has part clause
    //   unfortunately a CSS rule is N-ary
    "css:PropertySetting": { comment: "A CSS property and a value" },

    "css:Rule": { comment: "Selector x any number of settings" },

    "css:Value": { comment: "" },

    "@graph": [
      // There are lots and lots of definitions in this namespace
      {},
    ],
  };
});
