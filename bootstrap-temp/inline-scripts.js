// Replace external script references with the content of the referenced scripts.
(async function () {
  // Modules loaded by our AMD loader will be inlined by
  // `amd-module-persistence` and should be ignored here.
  // The `is-temporary` marker is provided for this purpose.
  const scripts = [
    ...document.querySelectorAll("script[src]:not([data-is-temporary])"),
  ];
  if (scripts.length && window.location.protocol === "file:") {
    console.warn(
      "MELD: The document is in file protocol.  Scripts cannot be directly inlined:",
      scripts.map(_ => _.src)
    );
    return;
  }
  for (const script of scripts) {
    try {
      const new_script = document.createElement("script");
      new_script.setAttribute("data-source", script.src);
      const response = await fetch(script.src);
      new_script.innerHTML = await response.text();
      // We could put a placeholder where the original script was located
      // instead of relying on the element.  However, if the script was just
      // removed by someone else, then it's probably not a good candidate for
      // inlining anyway.
      if (!script.parentNode) {
        console.warn("INLINE SCRIPTS: script element was removed", script);
      } else script.parentNode.replaceChild(new_script, script);
    } catch (error) {
      console.log("ERROR INLINING", error, script.src);
    }
  }
})();
