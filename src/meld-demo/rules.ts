// Scaffolding render rules

import { TraitQuery, DomTraitInterpreter } from "@def.codes/polymorphic-hdom";
import * as tx from "@thi.ng/transducers";

interface RuleSet {
  queries: TraitQuery[];
  interpreters: Record<string, DomTraitInterpreter | DomTraitInterpreter[]>;
}

// subject viewpoint :: subject + predicateList/JSON-LD object/Describe/Dispatch
// community viewpoint :: N-Triples/JSON-LD @graph/Construct/Announce
//
// We are processing claims.
// All day.
//
// Basics:
//
// We identify something called *models*.
//
// A Model is syntactically expressed as an RDF triple store.
//
// A Model is a community of claims, made in unison.
//
// New claims enter the community generally unbidden.
//
// But we accept them all as true.
//
//

// Okay, protocols:
//
// Keys
// Values
// Entries
//
// Mostly implemented already, but not QUITE uniformly.
//
//
// ## Discoverability of protocol implementations
//
// Are protocols reified?
// Are implementations?
// If not, how are they discovered?
// We must determine how each item best fulfills each protocol
//
//
export const RULES: RuleSet = {
  queries: [
    thing => thing && typeof thing === "object" && { id: "Dictionary" },
    // This is an implicit type, being OWL's uberclass.
    () => ({ id: "Thing" }),
    // Except that we don't want to do this sort of thing, we want to go by
    // datafiable, namespaced keys.
    thing =>
      thing &&
      // Special exception for string to avoid infinite recursion... :/
      typeof thing !== "string" &&
      typeof thing[Symbol.iterator] === "function" && { id: "Iterable" },
    // Again, we can extend prototypes to assign type
    thing => thing && typeof thing === "string" && { id: "Quoted" },
  ],

  // So, if datafy / nav should issue a key and value representing a dynamic
  // navigation/operation (like keys/values/entries), that can be afforded as data.
  // Representations of those subpaths are bound to their contexts.

  // This depends on a proxy being used for the context.
  interpreters: {
    Dictionary: [
      () => [
        {
          type: "contains",
          content: () => ({ Entries }, dict) => [
            "div.Entries",
            {},
            [Entries, dict],
            JSON.stringify(dict),
          ],
        },
      ],
    ],

    // All types translate to class. Should be issued once for each type
    "rdf:type": [({ type }) => [{ type: "has-class", class: type }]],

    // HERE we really want to say that there is a term (a bottom element) which
    // can itself fulfill that.
    //
    // But what if another rule preferred another element?  Can we just special
    // case it?  According to some special classification of HTML elements as
    // being more or less specific?  That I would have to make up.  A simple
    // rubric would resolve most cases (e.g. div and span are 0 points,
    // everything else is 1 and up).  (For svg, `g` is the zero-point
    // container.)
    Quoted: () => ({ type: "is-wrapped-by", wrap: _ => ["q", _] }),

    // -- What if I just want to see what keys are in the bags?
    //    Or some indication of the type of thing they are?
    //    Like, I'm okay just saying “give me the types of thing here.”
    // -- Cool.  When do you want to request this?
    // -- When I'm presenting a lot of things.
    // -- Define “a lot”.
    //
    // -- Like, enough that I think giving them a charter to take more liberties
    //    would be overspending our investment here.
    //
    // -- I'm still waiting for my answer.  How do I see what's in the bags?
    // And how can I express an intent whose type may not be recognized at the
    // time that I express it?  But which nevertheless matches later when a
    // handler materializes?
    //
    // -- How do I say, show me the Keys?  How do I say, the Keys shall be shown?
    //
    // -- Just make a Keys protocol.  That mostly delegates to built-ins of the
    //    same name.  Same for Values, same for Entries.  These are properties
    //    in a collections ontology.
    //
    // -- Okay, but then how do you trigger it from userland?  What do you say?
    //
    // ## Path in hash
    //
    // -- Suppose we interpret the hash as possibly describing a *path*
    //
    // -- (Really, since you can have multiple matches for any property, you're
    //    describing a subgraph query.)
    //
    // -- (I mean, if you click on a specific link... you descend along the
    //    relevant property.  But that implicitly half-includes any other
    //    resources related by the same property.  This is a feature of
    //    multi-valued properties.)

    // But you want to map "hasPart" rather than "iterable" class
    //
    // Iterable implies something different.  it needs to materialize the parts
    //
    // Do we consider the iterable to be stateful?
    //
    // Hard questions.
    //
    // In other words, we don't want to be dealing in terms of iterable right
    // here.  We can assume effective simultenaeity for purposes of forking paths from collections.
    //
    // Iterable is lower-level, we don't want to summon it, by requiring
    // knowledge of it, until absolutely needed.
    //
    // Collection datatypes carry *some* semantics.
    //
    // Collections can be
    // - keyed by string (Dictionary)
    // - keyed by arbitrary value (Map)
    // - indexed (Vector)
    // - hashed (Set)
    // - recursive (Tree)
    // - chained (List),
    // - or unrelated (Bag/MultiSet).
    //
    // While this doesn't tell you anything about the collection's content from
    // a domain perspective, it tells you something about the kind of algorithms
    // that perform well with that sort of thing.  It narrows the space of
    // likely usages, past or future.
    //
    //

    Thing: () => [
      // Would normally be implicit by having type map to class.  But for thing,
      // maybe won't reify each case.
      { type: "has-class", class: "Thing" },
    ],
    // How can we make a rule that shows properties by default?  We can't, and
    // that's actually good.  It means that we take a global perspective.

    // I want to say, to one level of inspection.
    // What do we find out.
    //
    // A second level of inspection would refine (not mask or blot out)
    // whatever was learned at the first level.
    Iterable: () => [
      {
        type: "contains",
        content: ({ show }, thing) => [
          "p",
          "I'm an iterable",
          ["p", "I contain these parts:"],
          // The context here is as a contained item.  It is not the preferred
          // place to fully show a resource.  The “charter” afforded here by the
          // caller is expected to be a diminishing resource, or else the
          // descent would never terminate.
          //
          // So how do we say here
          //
          // JUST INDICATE TYPE
          // And by type we mean
          // What we represent here has nothing to do with something we know right now.
          ["ul", {}, tx.map(item => ["li", [show, item]], thing)],
        ],
      },
      {
        type: "contains",
        content: ({ show }, thing) => [
          "div",
          "I'm also an iterable",
          ["p", "I contain these parts:"],
        ],
      },
    ],
  },
};
