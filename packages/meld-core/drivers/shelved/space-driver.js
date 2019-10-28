(function() {
  const SPACE_DRIVER = {
    claims: q(
      "Space subclassOf Container",
      // need a "document driver"?
      "Document subclassOf Container"
    ),
    rules: []
  };

  if (meld) meld.register_driver(SPACE_DRIVER);
  else console.warn("No meld system found!");
})();
