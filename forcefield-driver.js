// Helper to make RDF terms from clauses as written.
const q = (...clauses) =>
  clauses.map(clause =>
    clause
      .split(/\s+/)
      .map(term =>
        term[0] === "?" ? rdf.variable(term.slice(1)) : rdf.namedNode(term)
      )
  );

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
    "forceX subclassOf Force",
    "forceY subclassOf Force",
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
          system.register(x, () => d3[type]());
        else console.warn(`No such d3 force ${type}`);
      }
    },
    {
      when: q("?x isa Forcefield"),
      then({ x }, _) {
        _.register(x, () => d3.forceSimulation().stop());
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
    /* Special “connects” property */
    {
      // let the type be implicit
      // when: q("?force connects ?property"),
      when: q("?force isa forceLink", "?force connects ?property"),
      then({ force, property }, system) {
        const force_instance = system.find(force);

        const results = system.query_all(q(`?s ${property.value} ?o`));
        if (results) {
          const links = Array.from(results, ({ s, o }) => ({
            source: s.value,
            target: o.value
          }));
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
