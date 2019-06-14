(function() {
  // should these be here or in layers?
  const thing_position_css = space_id => ({ id, x, y }) =>
    `#${space_id} [data-thing="${id}"]{top:${y}px;left:${x}px}`;

  const things_position_css = (space_id, things) =>
    [...tx.map(thing_position_css(space_id), things)].join("\n");

  function position_things(style_ele, space_id, things) {
    style_ele.innerHTML = things_position_css(space_id, things);
  }

  const angle_of = (x, y) =>
    x === 0 ? (y < 0 ? 0 : Math.PI) : Math.atan(y / x) + (x < 0 ? Math.PI : 0);

  const angle_between = (x1, y1, x2, y2) => angle_of(x2 - x1, y2 - y1);
  const hypotenuse = (a, b) => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

  const property_placement_css = ({ triple, source, target, layer_id }) => {
    const [s, p, o] = triple;
    // const selector = `#${layer_id} [data-subject="${s.value}"][data-object="${
    const selector = ` [data-subject="${s.value}"][data-object="${o.value}"]`;
    const { x: x1, y: y1 } = source;
    const { x: x2, y: y2 } = target;
    const top = y1.toFixed(2);
    const left = x1.toFixed(2);
    const width = (hypotenuse(x2 - x1, y2 - y1) || 1).toFixed(2);
    const angle = angle_between(x1, y1, x2, y2).toFixed(2);

    // The second translate is useful if you have a property in each
    // direction between two nodes.  More than that would be hard.
    return `${selector}{width:${width}px;transform: translate(${left}px,${top}px) rotate(${angle}rad) translateY(-50%);}`;
  };

  function create_forcefield_dataflow({
    // for scoping of created style rules
    // instead, provide a place to contribute style rules directly?
    // even as objects?
    layer_id,
    // id if the forcefield resource with the associated siulation
    forcefield_id,
    // needed (indirectly) for getting at the created simulation
    // there's got to be a way to avoid this
    model_system,
    // which resources to include in the forcefield
    resources,
    // which properties for which to update positioning rules
    properties,
    // style elements that are targets the the bespoke rule updates
    nodes_style,
    properties_style
  }) {
    // simulation driving a/the FORCEFIELD
    const force_simulation = model_system.transform(
      tx.map(system => system.find(rdf.namedNode(forcefield_id))),
      tx.keep()
    );

    // set the (d3) nodes ARRAY for a/the FORCEFIELD from the identified resources
    // AND broadcast it
    const model_forcefield_nodes = rs
      .sync({ src: { resources, sim: force_simulation } })
      .transform(
        tx.map(({ resources, sim }) => ({
          sim,
          nodes: [...tx.map(({ value }) => ({ id: value }), resources)]
        })),
        tx.sideEffect(({ sim, nodes }) => sim.nodes(nodes)),
        tx.pluck("nodes")
      );

    // update FORCEFIELD node positions on every tick
    rs.sync({ src: { ticks, nodes: model_forcefield_nodes } }).subscribe({
      next: ({ nodes }) => position_things(nodes_style, layer_id, nodes)
    });

    // index SIMULATION nodes by resource identifier, for property positioning
    const nodes_by_id = model_forcefield_nodes.transform(
      tx.map(nodes =>
        tx.transduce(tx.map(node => [node.id, node]), tx.assocObj(), nodes)
      )
    );

    // passively place link representations from a FORCEFIELD/SIMULATION
    rs.sync({ src: { ticks, nodes_by_id, properties } }).transform(
      tx.map(({ nodes_by_id, properties }) =>
        [
          ...tx.iterator(
            tx.comp(
              tx.map(triple => ({
                layer_id,
                triple,
                source: nodes_by_id[triple[0].value],
                target: nodes_by_id[triple[2].value]
              })),
              tx.filter(_ => _.source && _.target),
              tx.map(property_placement_css)
            ),
            properties
          )
        ].join("\n")
      ),
      tx.sideEffect(css => (properties_style.innerHTML = css))
    );
  }

  // Helper.  Both forces and forcefields use this pattern for setting properties.
  const setter = ({ x, p, v }, { find }) => {
    const instance = find(x);
    const property_name = p.value;
    const value = v.value;
    if (!instance) {
      console.warn(`No such ${x} to assign ${p} = ${v}`);
      return;
    }
    if (typeof instance[property_name] === "function")
      instance[property_name](v.value);
    else console.warn(`No such property ${property_name}`);
  };
  const FORCEFIELD_DRIVER = {
    claims: q(
      "Force isa Class",
      "Force subclassOf FrameSimulation",
      "forceX subclassOf Force",
      "forceY subclassOf Force",
      "hasForce domain Forcefield",
      "hasForce range Force",
      "hasBodies domain Forcefield",
      "hasTicks domain FrameSimulation",
      "hasTicks range Subscribable",
      // range is a set of resources
      "forceCenter subclassOf Force",
      "forceManyBody subclassOf Force",
      "forceLink subclassOf Force",
      "forceRadial subclassOf Force",
      "forceCollide subclassOf Force"
    ),
    rules: [
      {
        when: q("?x isa ?type", "?type subclassOf Force"),
        then: ({ x, type }, system) => {
          if (typeof d3[type] === "function")
            system.register(x, "Force", () => d3[type]());
          else console.warn(`No such d3 force ${type}`);
        }
      },
      {
        when: q("?x isa Forcefield"),
        then({ x }, _) {
          _.register(x, "Forcefield", () => d3.forceSimulation().stop());
        }
      },
      {
        when: q(
          "?field hasTicks ?ticks",
          "?source implements ?ticks",
          "?source as Subscribable",
          "?field hasNodes ?nodes",
          "?nodesource implements ?nodes",
          "?nodesource as Subscribable"
        ),
        then({ field, ticks, source, nodesource }, system) {
          const nodes_stream = system.find(nodesource);
          const simulation = system.find(field);
          const tick_stream = system.find(source);
          const nodes = simulation.nodes();

          const nodes_by_id = tx.transduce(
            tx.map(node => [node.id, node]),
            tx.assocObj(),
            nodes
          );
          console.log(`nodes_by_id`, nodes_by_id);
          console.log(`system.dom_root`, system.dom_root);

          const properties_style = system.dom_root.appendChild(
            document.createElement("style")
          );
          console.log(`properties_style`, properties_style);

          const v = rdf.variable;
          const properties = Array.from(
            system.query_all([[v("s"), v("p"), v("o")]]),
            ({ s, p, o }) => [s, p, o]
          );

          tick_stream.transform(
            tx.sideEffect(simulation.tick),
            tx.map(() =>
              [
                ...tx.iterator(
                  tx.comp(
                    tx.map(triple => ({
                      layer_id: "forcefield",
                      triple,
                      source: nodes_by_id[triple[0].value],
                      target: nodes_by_id[triple[2].value]
                    })),
                    tx.filter(_ => _.source && _.target),
                    tx.map(property_placement_css)
                  ),
                  properties
                )
              ].join("\n")
            ),
            tx.sideEffect(css => (properties_style.innerHTML = css))
          );
        }
      },
      {
        // OR, you could use this to imply that
        // OR... you could actually do both.  that's a different kind of rule
        when: q("?field isa Forcefield", "?field hasForce ?force"),
        then({ field, force }, system) {
          const simulation = system.find(field);
          const force_instance = system.find(force);

          if (!simulation) console.warn(`No such forcefield`, field);
          else if (!simulation.force)
            console.warn(`No force method on`, simulation, "for", field);
          else if (!force_instance)
            console.warn(`No such force`, force, "for", field);
          // assume force is an RDF term so value is its key.  or toString
          else simulation.force(force.value, force_instance);
        }
      },
      {
        // assume bodies is a stream
        when: q(
          "?field hasBodies ?bodies",
          "?source implements ?bodies",
          "?source as Subscribable"
        ),
        then: ({ field, bodies, source }, system) => {
          const simulation = system.find(field);
          const bodies_instance = system.find(source);

          const nodes_id = mint_blank();
          system.assert([field, rdf.namedNode("hasNodes"), nodes_id]);
          system.register(nodes_id, "Subscribable", () =>
            bodies_instance.transform(
              tx.trace("BODIES"),
              tx.map(bodies =>
                // Hmmmm... depends on query variables
                Array.from(bodies, body => ({ id: body.subject.value }))
              ),
              tx.sideEffect(simulation.nodes),
              tx.trace("NODES!!!")
            )
          );
        }
      },
      /* Special “connects” property */
      {
        // let the type be implicit
        // when: q("?force connects ?property"),
        when: q("?force isa forceLink", "?force connects ?property"),
        then({ force, property }, system) {
          const force_instance = system.find(force);

          // Hardcode id accessor.  Userland has no need to get at this, as the id
          // is always tied to the resource name.
          force_instance.id(node => node.id);

          const results = system.query_all(q(`?s ${property.value} ?o`));
          if (results) {
            const links = Array.from(results, ({ s, o }) => ({
              source: s.value,
              target: o.value
            }));
            // TODO: This should not be an issue now
            // HACK: nodes may not be set yet.
            setTimeout(() => force_instance.links(links), 17);
          }
        }
      },

      // TEMP avoid need for logic driver
      // { when: q("?x isa Force", "?x ?p ?v"), then: setter },
      {
        when: q("?x isa ?type", "?type subclassOf Force", "?x ?p ?v"),
        then: setter
      },
      { when: q("?x isa Forcefield", "?x ?p ?v"), then: setter }
    ]
  };

  if (meld) meld.register_driver(FORCEFIELD_DRIVER);
  else console.warn("No meld system found!");
})();
