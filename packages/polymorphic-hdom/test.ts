// initial complete test cases

namespace MELD {
  // Is this MELD context at large, or just for render?  I suppose if it's a
  // proxy then it's a kind of uber-object.
  export interface Context {
    /** Probably specialize data factory and re-export. provides a factory with
     * reference identity among terms. */
    readonly rdf: import("@def.codes/rdf-data-model").DataFactory;
    readonly show;

    readonly [key: string]:
      | boolean
      | number
      | bigint
      | symbol
      | readonly any[]
      | any // TEMP, but dataFactory  isn't one of those, it's an interface
      | Context;
  }

  interface Template {}

  interface Macro {
    (thing: any, context: Context): Template;
  }
}

// GENERAL
// - dereference vocabularies
// - the description of the vocabularies should be *very* user-facing, not an afterthought.
//   - okay, how? treat it like labeling, make it almost-first class.
//   - almost first-class: is that just, not from this domain (for some def of “this”)
//   - i.e. any term is “almost” first-class in relation to another term.
//   - it is first-class from its own point of view
//   - shouldn't this lead to a visual difference?
//   - in other words, there is plenty of information in tagged terms
//   - and we are using some of those vocabularies
//     - or have written descriptions of our own
//
// Containers: a domain Associate visual idiom with a vocabulary?  Or at least
// distinction of vocabularies?  There are endless dimensions to vocabularies,
// how could these map to physical traits?

/*
  Making rdf.context a proxy... could have interesting consequences.  Not least
  being incredibly slow.  But if it is something a la carte, not every time
  (like value).  And it means no crashing on missing key references.  Wait, you
  mean a deep proxy?  Wow.  You could create whole chains of things
  structurally.  It's kind of interesting.  For patterns.  Like to think that
  you could just start thinking by chaining terms and turning them into
  something.  The language doesn't have to be triples *per se*, and it doesn't
  even have to be a written language.  Or even a writable language.  But it
  means you could say something like
*/
const rules_for_render_with_deep_proxy_for_context = {
  // We can't use proxies in the queries, that would just be too slow.  And it's
  // not really needed.  You can construct queries from descriptions.  But
  // you're talking about a more liberal sense of term expansion.
  queries: [
    // trait - rdf:label, skos:label
    //
    () => {},
    // something about labeling
    // labeling is a term in some domain
    // but it is not referenced in the mechanism.
    //
  ],
  interpreters: [
    // something about labeling
  ],
};

// You don't really need to name this.  This will be provided as data.  There
// are no default renders as such.
const some_render = (subject: object) => [];

const label_for = (subject: object) => {
  // Is there an ID?
  ["@id"];
  // look for SKOS label, etc
  //
  // I think Fresnel has a set of rules for labeling, and they are fine
};

/**
  This is __label__
  __term__ is a __
*/

const describe = (thing: any, { show, rdf }) => [
  // "This is".en,
  show.label_for(thing),
  ".",
  [label_for, thing],
  // [hyperlink_to, [type_of(thing)]],
];

// This is i/o for what?

// What does a window look like?

// A “window” is a container.
const window_output = [
  "div", // general wrapper
  { class: "Container Window" },
];

/**
  This is __label__
    a _`nfo`_:`Folder_`

  from vocabulary __NFO: Nepomuk File Ontology__

*/
// We don't really want to have a show function, functions here (in this
// execution context) are always interpreted as “show”.  Also templates should
// be defined in userspace.
//
// Is this a general macro expand language?  Yes, the context changes, but we
// are still querying for a pool of interpreters.  In other words, we can make
// callbacks amenable to expressions, and we won't need declarations.  But I
// can't avoid it here, so this should be in plain data.  move to JS for examples
//
// But you get this for free by having a rule specifying it.
const show_nfo$Folder = ["div", { class: "Container nfo$Folder" }];

const show_rdf$Term = [""];

// What does an nfo:FileDataObject look like?
//
//

// what does a “halo” look like?
//
// A “halo” is a UI element with affordances for operations that you can perform
// on another thing.  It is always “attached to” something else.  “Attached to”
// is a trait but would need a process to implement (e.g. to track the thing).
const halo_output = [
  "div", // general wrapper
  { class: "Halo" },
  // widgets.
  // widget itself will presumably have a template
  [
    "div",
    { class: "Affordance Widget", widget: "inspect" },
    "content of widget",
  ],
  [
    "div",
    { class: "Affordance Widget", widget: "export" },
    "content of widget",
  ],
];

// What does a “queue” look like?
//
// A “queue” is a FIFO collection type.
const queue_output = [
  "div",
  { class: "Collection Queue" }, // why p?
  ["p", {}, [{ what: "Property" }, "co:size"], [{ what: "value" }, "3"]],
  // For queues, we may not actually show each value, but rather just an
  // indicator.  But how would this be annotated?
  ["ol", {}, ["li"], ["li"], ["li"]],
];

// What does a “portal” look like?
//
// A “portal” is a view into another space.  Its contents will generally be
// controlled by a process independent of the process that controls the portal
// itself.
const portal_output = [];

//  What does a test result look like?
//
// A “test result” is a record bearing information about a test that was
// performed.
const test_result_output = [
  [
    "div", // general wrapper
    { class: "test$result" },
    ["details", {}, ["summary"]],
  ],
  // labelling:
  // - indicator of whether it passed
  // - name of the test case
  // details
  //   the input
  //   the expected output
  //   for failing tests,
  //     the difference between the input and output
  //       this is a diff and may itself have some special presentation
];

// What does a vector look like?
//
// A “vector” is an indexed collection of values.  The values themselves are of
// arbitrary types.
const vector_output = [
  "div", // general wrapper
  { class: "Collection Vector" },
  // why p?
  ["p", {}, [{ what: "Property" }, "co:size"], [{ what: "value" }, "100"]],
  [
    "ol",
    {},
    // For each item value we defer back to the rules
    ["li", { index: "3" }, "item 1"],
    ["li", { index: "2" }, "item 2"],
    ["li", { special: "elipsis" }, "...elipsis..."],
    ["li", { index: "100" }, "item 100"],
  ],
];

// when items are shown in a graph
const graph_node_input = [];
const graph_node_output = [];

// what about things with svg and dom?

// what about graphs within graphs?  (that will be handled by containers and processes)

// what about... tables? grids? variables? circuits? game boards? boggle?

const test_case_1 = {
  input: [],
  output: test_result_output,
};
