(function() {
  const amd_define_code = ({ id, dependencies, factory }) =>
    `define("${id}", ${JSON.stringify(dependencies)}, ${
      typeof factory === "function"
        ? factory.toString()
        : JSON.stringify(factory)
    })`;

  window.addEventListener("https://def.codes/amd/define", event => {
    const { detail: definition } = event;

    const create = tag => document.createElement(tag);
    const append = (parent, child) => parent.appendChild(child);

    const cont = document.getElementById("amd-modules");
    const article = append(cont, create("article"));
    const details = append(article, create("details"));
    const summary = append(details, create("summary"));
    const heading = append(summary, create("h3"));
    const script = append(details, create("pre"));

    heading.innerHTML = definition.id;
    script.setAttribute("data-amd-module", definition.id);
    script.innerHTML = amd_define_code(definition);
  });
})();
