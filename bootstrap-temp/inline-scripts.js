(async function() {
  const scripts = [...document.querySelectorAll("script[src]")];
  if (scripts.length && window.location.protocol === "file:") {
    console.warn(
      "MELD: The document is in file protocol.  Scripts cannot be directly inlined:",
      scripts.map(_ => _.src)
    );
    return;
  }
  for (const script of scripts) {
    const new_script = document.createElement("script");
    new_script.setAttribute("data-source", script.src);
    const response = await fetch(script.src);
    new_script.innerHTML = await response.text();
    if (script.parentNode) script.parentNode.replaceChild(new_script, script);
    else console.error("no parent?", script, document.currentScript);
  }
})();
