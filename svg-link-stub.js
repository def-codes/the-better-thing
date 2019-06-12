
    /*
    for (const [ids, path] of path_eles.entries())
      path.setAttribute("d", path_data(ids));
*/

  // Fishy.  by_id is not actually used, but source/target lookup doesn't work
  // unless you await it.
  /*
  const model_links = rs
    .sync({ src: { by_id: forcefield_nodes_by_id, store: model_store } })
    .transform(
      tx.map(({ store }) =>
        tx.transduce(
          tx.comp(
            tx.filter(([, p]) => p === links_prop),
            tx.map(([s, , o]) => ({
              source: s.value,
              target: o.value
            })),
            tx.filter(_ => _.source && _.target)
          ),
          tx.push(),
          store.triples
        )
      )
    );

  rs.sync({ src: { links: model_links, sim: model_simulation } }).subscribe({
    next({ links, sim }) {
      sim.force(
        "grid",
        d3
          .forceLink(links)
          .id(_ => _.id)
          .strength(0.2)
          .iterations(2)
      );
    }
  });

  const model_link_eles = model_links.transform(
    tx.map(links => {
      const link_eles = new Map();
      for (const link of links) {
        const line = document.createElementNS(SVGNS, "line");
        line.classList.add("graph-edge");
        link_eles.set(link, line);
        svg.appendChild(line);
      }
      return link_eles;
    })
  );
  */

  /* these positions should be subscribable somewhere though
  rs.sync({ src: { ticks, link_eles: model_link_eles } }).subscribe({
    next({ link_eles }) {
      for (const [{ source, target }, line] of link_eles.entries()) {
        line.setAttribute("x1", source.x || 0);
        line.setAttribute("y1", source.y || 0);
        line.setAttribute("x2", target.x || 0);
        line.setAttribute("y2", target.y || 0);
      }
    }
  });
*/
  /*
  let search_path = [];
  hdom.renderOnce(["path.search.graph-path"], { root: svg_container });
  // // const hic2 = ["path.search", {}];
  // const search_path_ele = svg_container.appendChild(
  //   document.createElementNS(SVGNS, "path")
  // );
  // search_path_ele.classList.add("search", "graph-path");
  const search_path_ele = svg_container.querySelector(".search-path");

  const path_eles = new Map();
  for (const path of paths) {
    // const hic = ["path.solution", { d: "" }];
    const path_ele = document.createElementNS(SVGNS, "path");
    path_ele.classList.add("graph-path");
    path_eles.set(path, path_ele);
    svg_container.appendChild(path_ele);
  }
  */
  // TRANSITIONAL
  // path_search_stuff(graph, svg_container, path_data);
