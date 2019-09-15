(function() {
  window.addEventListener("https://def.codes/amd/define", event => {
    const { detail } = event;
    const { id, dependencies, factory } = detail;
    console.log({ id, dependencies, factory });

    const create = tag => document.createElement(tag);
    const append = (parent, child) => parent.appendChild(child);

    const cont = document.getElementById("amd-modules");
    const article = append(cont, create("article"));
    const details = append(article, create("details"));
    const summary = append(details, create("summary"));
    const heading = append(summary, create("h3"));
    const script = append(details, create("pre"));

    heading.innerHTML = id;
    script.setAttribute("data-amd-module", id);
    script.innerHTML = (typeof factory === "function"
      ? factory
      : new Function(`return (${factory})`)
    ).toString();
  });
})();
