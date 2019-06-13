(function() {
  // except I think this is not needed now
  // HACK: work around unwanted scrolling of page when focusing textarea.
  document.body.addEventListener(
    "focus",
    function(event) {
      event.preventDefault();
      if (event.target.classList.contains("userland-code-input")) {
        const ex = event.target.closest(".example");
        if (ex) {
          ex.scrollIntoView();
        }
      }
    },
    true
  );
})();
