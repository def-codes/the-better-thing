// Viewing of dataflow resources
import { register_driver } from "./system.mjs";
import rdf from "./rdf.mjs";
import { render, render_value } from "./value-view.mjs";

const n = rdf.namedNode;
const v = rdf.variable;
const ISA = n("isa");

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
        // TODO: Two-part proposal for dealing with this.
        //
        // The more concise way to say this would be something like
        //
        //  ∃
        //    listensTo(listensTo.?thing, transformsWith(mapsWith(RENDER_VALUE))),
        //      transformsWith(hasRoot.?container)
        //
        // Requirement is to keep the implied nodes anonymous but still defend
        // against the rule firing again.
        //
        // Part 1: Support “there exists” conclusions,which may contain
        // unbound variables.  To implement this, you can run a synchronous
        // test when the rule fires.  If it passes (something matches), you're
        // done.  If it fails, then you substitute new blank nodes for the
        // variables and assert the result.
        //
        // Part 2: Support “there exists” conclusions with implicit blank
        // nodes. For cases like this one, where you don't actually need
        // explicit unbound variables in the conclusion.  To implement this,
        // you would need a variant of the Turtle-like expression expander
        // that used (“minted”) variables instead of blank nodes for
        // placeholders.  These unbound variables would be treated as above.
        const listener = v(`ListenerFor${view.value}`);
        const listener2 = v(`Listener2For${view.value}`);
        const mapper = v(`MapperFor${view.value}`);
        const xform = v(`HdomFor${view.value}`);
        return {
          assert: [
            [listener, LISTENS_TO, thing],
            [listener, TRANSFORMS_WITH, mapper],
            [mapper, n("mapsWith"), RENDER_VALUE],
            [listener2, LISTENS_TO, listener],
            [listener2, TRANSFORMS_WITH, xform],
            [xform, n("hasRoot"), container]
          ]
        };
      }
    }
  ]
}));
