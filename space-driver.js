(function() {
  const SPACE_DRIVER = {
    claims: q(
      "Space isa Class"
      // Special thing referring to this model
      //"model"
      // properties of space??
    ),
    rules: []
  };

  if (meld) meld.register_driver(SPACE_DRIVER);
  else console.warn("No meld system found!");
})();
