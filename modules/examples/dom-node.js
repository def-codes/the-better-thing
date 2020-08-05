define([], () => {
  return {
    "@context": {
      id: "@id",
      type: "@type",
      ele: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/",
      // But not everything is actually in the Attributes reference, e.g. href
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href
      // Could set context vocab to this for elements?
      // Buuuuut, you should use w3 for that.
      text: "https://developer.mozilla.org/en-US/docs/Web/API/Text",
      att: "https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/",
      nie: "http://oscaf.sourceforge.net/nie.html#nie:",
      hasPart: "nie:hasPart",
      value: "rdf:value",
    },
    "@graph": [
      {
        id: "_:n1",
        type: "ele:a",
        "att:href": "http://willshake.net/",
        hasPart: ["_:n2", "_:n3"],
      },
      { id: "_:n2", type: "text", value: "Once upon a time" },
      { id: "_:n3", type: "html" },
      { id: "_:n4", type: "ele:i" },
      { id: "_:n5", type: "ele:a" },
    ],
  };
});
