// examples of API usage
// working out “real” cases

import { renderOnce } from "@thi.ng/hdom";
import { DomTraitInterpreter, Trait, TraitQuery } from "./api";
import { make_renderer } from "./make-renderer";

export function some_context(
  queries: TraitQuery[],
  interpreters: Record<string, DomTraitInterpreter[]>,
  entry_point: any
) {
  const render = make_renderer(queries, interpreters);
  renderOnce([render, entry_point], { ctx: { render } });
}

export const EXAMPLE_TRAITS: Trait[] = [
  { id: "links to", href: "#Alice" },
  { id: "is quoted" },
  { id: "indicator" },
  { id: "affordance" },
  { id: "glowing" }, // probably could do with just `isa` & .Glowing class
  { id: "disc" },
  { id: "porthole" },
  { id: "scalable / fit to container" }
];

// examples of trait queries
export const EXAMPLE_QUERIES: TraitQuery[] = [
  // when
  // looking at a thing that has a test:passed property
  // and rendering its label?
  // also include test:passed
  // or just put it in the group of things considered a label

  (thing, context) => [],

  // text literals (being displayed *as literals*?) are quoted
  subject => subject.termType === "Literal" && { id: "is quoted" },

  subject => has_type(subject, "dt:Vector") && { id: "is bracketed" },
  subject =>
    has_type(subject, "dt:Vector") && {
      id: "is bracketed",
      before: "{",
      after: "}"
    },

  // having a type maps to “has type” trait
  subject =>
    // how we get access to the store... another matter
    sync_query(store, {
      where: [subject, "a", "?type"]
      // IDEA let type be a trait id. makes matching easier
    }).map(({ type }) => [{ id: type }, { id: "rdf:type", type }])
];

// examples of interpreters
export const EXAMPLE_INTERPRETERS: Record<
  string,
  DomTraitInterpreter | DomTraitInterpreter[]
> = {
  "is quoted": () => ({ type: "is-wrapped-by", wrap: _ => ["q", _] }),

  "is bracketed": ({ before, after }) => ({
    type: "is-wrapped-by",
    // TODO: this would have a different SVG interpretation
    wrap: _ => [
      "div.bracketed",
      ["span.bracket-before", ["span.text", left || "["]],
      _,
      ["span.bracket-after", ["span.text", right || "]"]]
    ]
  }),

  // Collection shows count.  But wouldn't it do that anyway?
  // maybe you want to assert that collection count is a labeling property
  "rdf:Collection": {
    type: "contains",
    content: ({ render }) => [
      "span",
      [render, { context: "TODO: traverse into collection:count??" }]
    ]
  },

  // Use ol for ordered collection?
  // "rdf:OrderedCollection": () => ({type: "?"})

  // Use ul for unordered collection?
  // "rdf:UnorderedCollection": () => ({type: "?"})

  // All types translate to class
  // Should be issued once for each type
  "rdf:type": [({ type }) => [{ type: "has-class", class: type }]],

  // at some keypath
  "has halo": () => ({
    type: "is-wrapped-by",
    wrap: _ => ["div.halo", _, "a bunch of affordances for meta things"]
  })
};

export const EXAMPLE_INTERPRETERS_0: DomTraitInterpreter[] = [
  // when rendering the label of a thing with test:passed = true
  // the details (group? everything but label?) are collapsed
  //
  // trait InGroup
  // group: "details",
  // property: everything not in another group

  // when rendering a property that is a literal
  // include its value as a data attribute

  // Collapsed
  // could include in the trait something about what to keep
  _trait => [
    {
      type: "is-wrapped-by",
      wrap: template => [
        "details",
        // TODO: is recur sent to this function? or should this return an hdom
        // function? (which would get it from context)
        //
        // TODO: how to recur with label as lens/view/context
        //
        // BUT... anyway what if the template is already rendering label? which
        // is likely.
        ["summary", "TBD..... recur with label (“lens”)"],
        ["div.details", template]
      ]
    }
  ],

  // general visibility?  this would have to be in a specific context.  but for
  // the trait to be present, you would have matched already, so that's already
  // covered, right?
  //
  // subject . ?predicate .?object
  // preferring show to render
  // very hand wavy
  ({ predicate, object }) => [
    {
      type: "contains",
      content: ({ show } /*, thing*/) => [
        "div.Property",
        { "data-predicate": predicate.value, etc: "etc" },
        [show, object]
      ]
    }
  ]
];
