// Viewing of dataflow resources
import { register_driver } from "../system";
import rdf from "@def.codes/rdf-data-model";
// Should these be provided by system?
import { with_scanner } from "@def.codes/expression-reader";
import { as_triples } from "@def.codes/rdf-expressions";

const n = rdf.namedNode;
const v = rdf.variable;
// const ISA = n("isa");

// @ts-ignore: yeah, it's not a string
const RENDER_VALUE = rdf.literal(render_value, n("javascriptFunction"));
const LISTENS_TO = n("listensTo");
const TRANSFORMS_WITH = n("transformsWith");

register_driver("viewDriver", ({ q }) => ({
  claims: [
    ...q(
      "viewOf domain View"
      // TBD
      // "viewOf range Resource"
      // "contains domain Container",
      // "contains range Content"
    )
    // TODO: s/b rdf:value, and should be able to dereference.  i.e. a ref to
    //   this should work in place of the literal (polymorphically)
    //[n("Render"), n("value"), RENDER_VALUE]
  ],
  rules: [
    {
      when: q(
        "?view viewOf ?thing",
        "?thing isa Subscribable",
        "?view viewIn ?container"
      ),
      then: ({ view, thing, container }) => {
        const listener = v(`ListenerFor${view.value}`);
        const listener2 = v(`Listener2For${view.value}`);
        const mapper = v(`MapperFor${view.value}`);
        const xform = v(`HdomFor${view.value}`);

        const [scanned1] = with_scanner(_ =>
          _.doodad1(
            _.listensTo(thing),
            _.transformsWith(
              _.mapsWith(RENDER_VALUE)
              //_.mapsWith(x => ["pre", {}, x.toString()])
              //_.partitionsBy(3)
            )
          )
        );
        console.log(`scanned1`, scanned1);

        const blah1 = as_triples(scanned1);
        console.log(`blah1`, blah1);

        const [scanned2] = with_scanner(_ =>
          _.doodad2(
            _.listensTo(_.doodad1),
            _.transformsWith(_.hasRoot(container))
          )
        );
        console.log(`scanned2`, scanned2);

        const blah2 = as_triples(scanned2);
        console.log(`blah2`, blah2);

        return {
          assert: [
            [listener, LISTENS_TO, thing],
            [listener, TRANSFORMS_WITH, mapper],
            [mapper, n("mapsWith"), RENDER_VALUE],
            [listener2, LISTENS_TO, listener],
            [listener2, TRANSFORMS_WITH, xform],
            [xform, n("hasRoot"), container]
            //...blah
          ]
        };
      }
    }
  ]
}));
