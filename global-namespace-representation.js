"use-strict";

define("@def-codes/meld/global-namespace-representation", [], () => {
  const represent_global_namespace_in = id => {
    const container = document.getElementById(id);
    if (container)
      for (const key in globalThis) {
        const item = container.appendChild(document.createElement("p"));
        item.innerHTML = `${key}: ${typeof key}`;
      }
    else console.warn(`Container ${id} does not exist`);
  };

  return { represent_global_namespace_in };
});
