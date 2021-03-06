// Is “tell” replacing “trait”?
//
// examples of API usage
// working out “real” cases
import * as tx from "@thi.ng/transducers";
import { renderOnce } from "@thi.ng/hdom";
import { DomTraitInterpreter, Trait, TraitQuery } from "./api";
import { make_renderer } from "./make-renderer";

const has_type = (...anyargs) => true;
const sync_query = (store, query) => [];
const store = {};

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
  { id: "scalable / fit to container" },
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
      after: "}",
    },

  subject =>
    // query can close over store at source... but userland?
    // if things are automatically datafied, you avoid this problem
    // because the value will already have type
    // let type be a trait id as well. makes matching easier
    [
      ...tx.map(
        ({ type }) => [{ id: type }, { id: "rdf:type", type }],
        sync_query(store, { where: [subject, "a", "?type"] })
      ),
    ],
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
      ["span.bracket-before", ["span.text", before || "["]],
      _,
      ["span.bracket-after", ["span.text", after || "]"]],
    ],
  }),

  // Collection shows count.  But wouldn't it do that anyway?
  // maybe you want to assert that collection count is a labeling property
  "rdf:Collection": () => ({
    type: "contains",
    content: ({ render }) => [
      "span",
      [render, { context: "TODO: traverse into collection:count??" }],
    ],
  }),

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
    wrap: _ => ["div.halo", _, "a bunch of affordances for meta things"],
  }),
};

// How can you tell it's a DOMAIN?

// How can you tell it's an `rdf:Term` look like?

// How can you tell it's a NAVIGABLE SPACE?

// What does an Indicator

// How can you tell it's an Indicator?
// deep. if you can tell anything, then it's indicated something
// a tell is a kind of indicator

// How can you tell it's an Affordance?
// even better question.

// A triple in a context is a claim.

// How can you tell  it's Triple?

// is a tell just a type?
// thing has tell
// thing => tr

// How can you tell it's Quad?

// How can you tell it's TripleStore?

// How can you tell it's QuadStore?

export const EXAMPLE_INTERPRETERS_0: DomTraitInterpreter[] = [
  // when rendering the label of a thing with test:passed = true
  // the details (group? everything but label?) are collapsed
  //
  // trait InGroup
  // group: "details",
  // property: everything not in another group

  // when rendering a property that is a literal
  // include its value as a data attribute

  // This happens automatically via type rule
  // ["div", { class: "Container nfo$Folder" }]

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
        ["div.details", template],
      ],
    },
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
        [show, object],
      ],
    },
  ],
];
