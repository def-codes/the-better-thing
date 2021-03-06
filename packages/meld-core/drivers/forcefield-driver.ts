// Adapt model statements to d3 force mechanism
import rdf from "@def.codes/rdf-data-model";
import * as rs from "@thi.ng/rstream";
import * as tx from "@thi.ng/transducers";
import * as d3 from "d3-force";

const n = rdf.namedNode;
const l = rdf.literal;
const v = rdf.variable;
const mint_blank = () => rdf.blankNode();

const parts_to_bodies = (parts: Iterable<any>) =>
  Array.from(parts, _ => ({
    id: _.part.value,
    x: Math.random() * 500,
    y: Math.random() * 500,
  }));

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
  properties_style,
}) {
  const ticks = rs.fromRAF();

  // simulation driving a/the FORCEFIELD
  const force_simulation = model_system.transform(
    // @ts-ignore WAAAAT?
    tx.map(system => system.find(n(forcefield_id))),
    tx.keep()
  );

  // set the (d3) nodes ARRAY for a/the FORCEFIELD from the identified resources
  // AND broadcast it
  const model_forcefield_nodes = rs
    .sync({ src: { resources, sim: force_simulation } })
    .transform(
      tx.map(({ resources, sim }) => ({
        sim,
        nodes: [...tx.map(({ value }) => ({ id: value }), resources)],
      })),
      tx.sideEffect(({ sim, nodes }) => sim.nodes(nodes)),
      tx.pluck("nodes")
    );

  // update FORCEFIELD node positions on every tick
  rs.sync({ src: { ticks, nodes: model_forcefield_nodes } }).subscribe({
    next: ({ nodes }) => position_things(nodes_style, layer_id, nodes),
  });

  // index SIMULATION nodes by resource identifier, for property positioning
  const nodes_by_id = model_forcefield_nodes.transform(
    tx.map(nodes =>
      tx.transduce(
        tx.map(node => [node["id"], node]),
        tx.assocObj(),
        // @ts-ignore
        nodes
      )
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
              target: nodes_by_id[triple[2].value],
            })),
            tx.filter(_ => _.source && _.target),
            tx.map(property_placement_css)
          ),
          properties
        ),
      ].join("\n")
    ),
    tx.sideEffect(css => (properties_style.innerHTML = css))
  );
}

export default {
  name: "forcefieldDriver",
  init: ({ q, is_node }) => ({
    claims: q(
      "Force isa Class",
      // "Force subclassOf FrameSimulation", // doesn't even make sense
      "forceX subclassOf Force",
      "forceY subclassOf Force",
      "hasForce domain Forcefield",
      "hasForce range Force",
      "hasBodies domain Forcefield",
      // "hasTicks domain FrameSimulation",
      "hasTicks range Subscribable",
      "forcefieldFor domain Forcefield",
      // "forcefieldFor range Space", // maybe too specific
      // range is a set of resources
      "forceCenter subclassOf Force",
      "forceManyBody subclassOf Force",
      "forceLink subclassOf Force",
      "forceRadial subclassOf Force",
      "forceCollide subclassOf Force"
    ),
    rules: [
      {
        when: q("?subject isa ?type", "?type subclassOf Force"),
        then: ({ subject, type }) =>
          typeof d3[type.value] === "function"
            ? { register: { subject, as_type: "Force", using: d3[type.value] } }
            : {
                warning: {
                  message: `No such d3 force ${type}`,
                  context: { d3 },
                },
              },
      },
      {
        when: q("?subject isa Forcefield"),
        then: ({ subject }) => ({
          register: {
            subject,
            as_type: "Forcefield",
            using: () => d3.forceSimulation().stop(),
          },
        }),
      },
      {
        when: q(
          "?forcefield hasTicks ?ticks",
          "?simulation implements ?forcefield",
          "?source implements ?ticks",
          "?source as Subscribable"
        ),
        then: ({ forcefield, simulation, source }, { find }) => {
          const sim = find(simulation);
          return {
            register: {
              subject: n(`${forcefield.value}$ticks`),
              as_type: "Subscribable",
              using: () =>
                find(source).transform(
                  tx.sideEffect(sim.tick),
                  tx.map(() => sim.nodes())
                ),
            },
          };
        },
      },
      {
        // this rule does two independent things
        when: q("?ff forcefieldFor ?space"),
        then: ({ ff, space }) => {
          const bodies = n(`${ff.value}$bodies`);
          const bodiesxform = n(`${ff.value}$bodyxform`);
          const query = n(`${ff.value}$bodyquery`);

          return {
            assert: [
              [n(`${ff.value}$tq`), n("queryText"), l(`?s hasPart ?part`)],
              [query, n("queryText"), l(`${space.value} hasPart ?part`)],
              [bodies, n("listensTo"), query],
              [bodies, n("transformsWith"), bodiesxform],
              // @ts-ignore: abuse
              [bodiesxform, n("mapsWith"), l(parts_to_bodies)],

              [
                n(`${space.value}$styles`),
                n("listensTo"),
                n(`${ff.value}$ticks`),
              ],
            ],
          };
        },
      },
      {
        // OR, you could use this to imply that
        // OR... you could actually do both.  that's a different kind of rule
        when: q(
          "?field isa Forcefield",
          "?field_impl implements ?field",
          "?field hasForce ?force",
          "?force_impl implements ?force"
        ),
        then(context, { find }) {
          const { field, force, field_impl, force_impl } = context;
          const simulation = find(field_impl);
          const force_instance = find(force_impl);

          if (!simulation)
            return {
              warning: { message: `No such forcefield ${field}`, context },
            };

          if (!simulation.force)
            return {
              warning: {
                message: `No force method on simulation`,
                context: { ...context, simulation },
              },
            };

          if (!force_instance)
            return {
              warning: {
                message: `No such force ${force} for ${field}`,
                context,
              },
            };

          // assume force is an RDF term so value is its key.  or toString
          simulation.force(force.value, force_instance);
          return {}; // TODO: side-effecting!
        },
      },
      // Stopgap until we have a general solution for subsystem ports
      {
        when: q("?forcefield isa Forcefield"),
        then: ({ forcefield }) => ({
          assert: [
            [forcefield, n("hasBodies"), n(`${forcefield.value}$bodies`)],
          ],
        }),
      },
      {
        // assume bodies is a stream
        when: q(
          "?forcefield hasBodies ?bodies",
          "?simulation implements ?forcefield",
          "?source implements ?bodies",
          "?source as Subscribable"
        ),
        then: ({ forcefield, simulation, source }, { find }) => ({
          register: {
            subject: n(`${forcefield.value}$BodiesListener`),
            as_type: "Subscribable",
            using: () =>
              find(source).subscribe({ next: find(simulation).nodes }),
          },
        }),
      },
      /* Special “connects” property */
      {
        // let the type be implicit
        // when: q("?force connects ?property"),
        disabled: true,
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
              target: o.value,
            }));
            // TODO: This should not be an issue now
            // HACK: nodes may not be set yet.
            setTimeout(() => force_instance.links(links), 17);
          }
        },
      },

      // TEMP avoid need for logic driver
      // { when: q("?x isa Force", "?x ?p ?v"), then: setter },
      {
        when: q(
          "?x isa ?type",
          "?type subclassOf Force",
          "?impl implements ?x",
          "?impl as Force",
          "?x ?p ?v"
        ),
        then: ({ x, p, v, impl }, { find }) => {
          const instance = find(impl);
          if (!instance)
            return {
              warning: { message: `No such ${x} to assign ${p} = ${v}` },
            };

          const property_name = p.value;
          const setter = instance[property_name];
          if (typeof setter !== "function")
            return property_name === "isa"
              ? {}
              : {
                  warning: {
                    message: `No such property ${property_name} on force ${x}`,
                  },
                };

          setter(v.value);
          return {}; // TODO: side-effecting!
        },
      },
      // Possibly reuse above consequent.  Both forces and forcefields use this
      // pattern for setting properties.
      //
      // { when: q("?x isa Forcefield", "?x ?p ?v"), then: setter },
    ],
  }),
};
