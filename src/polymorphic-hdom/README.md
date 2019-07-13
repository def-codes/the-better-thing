# Towards a dynamic, composable, polymorphic approach to rendering things

“hands-free” description of what things look like

not entirely declarative.  can use power of host language (currently)

considering assuming linked data

based on
[@thi.ng/hdom](https://github.com/thi-ng/umbrella/tree/master/packages/hdom)

## STILL MISSING

Working cases
notion of grouping, e.g. X is a “labeling” property
How do you determine which element to use at bottom?
- seems no way to avoid conflict resoluton
Accumulate context
Where do traversals take place?  Example?
How will datafy be used?
- should render act as a datafy/nav loop?  i.e. automatically datafy inputs?

Are queries and interpreters bound together? no and that's good
But it seems we have a lot of "when/then"
is that all mediated by traits?
yes



## Goals

open-world: independent, rule-based assertion about aspects (traits) of things'
appearance

compositional: allow multiple rules to operate at the same time on the same
things.  design vocabulary to avoid inherent conflict

polymorphic: use powerful query/selection and knowledge of ontology / hierarchy
(where conflict resolution necessary)

dynamic: operation takes the rule set as input (on each render)


talk about both values and resources?  or first convert values to
pseudo-resources? (JSON-LD-like)


separate selection and rendering


## Concepts

“queries” can use arbitrary logic: spec-like predicate composition/conform,
sequence fsm.  logic is opaque to this system.

“traits” mediate between domains of appearance and structure, i.e. between
abstract descriptors and concrete interpretations.  A trait can be basically
anything.

uniform: dynamic datafy unifies traversal of RDF graphs, host values and
interfaces, etc (but emphasis on namespaced properties and datatyped values)

composable template operations resemble function “advice” (as in Emacs Lisp)

in principle, could support audio interpretation

  
## (Domain) Terms

elision




## Motivating cases


term should indicate term type (named node, blank node) in metadata (attribute)
named nodes should link to their IRI (with caveats)
named nodes should use active prefixes when applicable (TBD)
variable nodes should appear with question marks (as placeholders)
blank nodes should appear as anonymous terms... (avoid showing node id)
literals should appear as values
triples (separate topic) should appear as s -> p -> o


set should appear as enclosed in braces (like the mathematical notation)
set should show item count
set should show some members
set should fit to container
set should indicate that it's a set even when it's empty
set should indicate that it's a set even when it has no room to show members
set should not show in excess of 50 members



dictionary should show item count
dictionary should show some key-value pairs
dictionary should fit to container
dictionary key-value pairs should have arrow pointing from key to value
dictionary should not show in excess of 50 key-value pairs
dictionary should indicate that it's a dictionary even when it's empty
dictionary should indicate that it's a dictionary even when it has no room to show members


vector should appear as enclosed in brackets (like the mathematical notation)
vector items should appear as distinct
vector should show item count
vector should fit to container
vector should not show in excess of 50 items
vector should show both head and tail when elided
vector should indicate elision when elided
vector should indicate that it's a vector even when it's empty
vector should indicate that it's a vector even when it has no room to show members

## questions

why is it important that the *renderer* can traverse?
It's not about the renderer-- need a better name for this.
it's just a computation.  it's a macroexpander

How does JSON-LD do key dictionaries?


## example

So for example, because the term is expanded with that macro, that protocol,
that recognizes types of things everywhere, the label itself can be expanded to
see the template that produced it.  Which will include the rule whereby the
label was selected.  And how do you inspect the label?  Through the halo.
And how does the template find who produced it?  Provenance.

Terms appear as first-class in their domain.  In the context of other
vocabularies, they appear second-class.

That is, terms have the "trait" of being first-class, when it shares in the
namespace of its immediate context.

The rule is a thing.  Templates will never help you produce
arbitrarily-navigable data.  What happens when you traverse from a 

OMG.  This is it.  You build a thing that "searches" the file system by linked
data navigation, and you show how by a sequence of evolutions, the system can be
made into a boggle solver (by changing userland rules.)

That means, you don't have module-bound callbacks.  Which I now say may be
executed in the context of a "global" proxy.  Because... it would be so "free".


In matching context, Alice has trait.  You can express traits through this
language as well.  But traits... yes, they'll have IRI's.  You can talk about
them.  But they are parametric and have instances.

Meanwhile, the interpreters match on types as well.
```
({Alice}) => Alice.is.Indicable
```
And note you can't use dot notation in the braces. You  would need more context
here, anyway.

For example, everything should be indicable.  So you could say
```
forall($subject.is.Resource)($subject.is.Indicable)
```

So yes, you can make macros, and you can make userland macros.  But yours have
to *contribute* something.  Yours have to support arbitrary graph
transformations.  To a degree that source encoded in text becomes even less
optimal.

Say this: if something is indicable... but for type, you don't need queries
because interpreters can deal with this directly.  Well, unless the trait (type)
needs other pseudo-properties set.  (Pseudo because it may be non-RDF data).

## to do

USE DESCRIPTIONS: labels, comments, ways to tell what they types mean.

MAKE TERMS NAVIGABLE

DETECT NAVIGATION

NAV/DATAFY

PROFIT

Not more javascript interop, but less javascript.


There it is.  You can do this without "scripting".  You can have a driver to
make a namespace "navigable".  That driver will register an event handler (on
its container?  And how does it track this?  Can bubble to body and get keys
from metadata?)

Navigable space.  You can datafy nav through the space.  The user clicks, you
datafy.  That's how you make this interactive in a rich, first-class,
substantive way, without having to introduce procedural drivers so soon.

The driver simply does one thing: listens to the space.

When links are clicked in the space... yes, this is something meld can do almost
at the system level.  Or driver.  But I mean, can do all of them in a single
handler.  If the entities are emitted using whatever RDFa is needed to
contextualize them, then  you can handle all with a general handler that:

- find the nearest navigable context
- nav to the link from there (taking unqualified terms as belong it to it)

Right now we don't have containers associated with namespaces.  In fact, there's
only one container.  So some of that complexity (the bubbling, the querying) is
not needed for an immediate implementation.

Another follow-on task from there is to accumulate a graph as you traverse.
This of course will be you can also have a nav process read ahead, to show what
paths you might go from wherever you are.

Going to a term as it is used in your model, to the home vocabulary of that
term, should feel like a big change.  In effect, the owner of that domain could
have some special leverage over how their domain is presented.  The system could
say that facts about what a domain should look like will be sourced from those
domains.  (Some of which may reside at def.codes).

So.  To recap.  The "realization" is that the user provides "the missing link"
in the mystery of both rendering and datafy nav, though there are still
unanswered questions.

For example, what happens when the user navigates?  How is the link associated
with a key-value pair of a context collection, as is necessary for the protocol?

Because a namespace can also be an object, you can represent another domain,
i.e. have a singleton representation of "that domain" locally.

"So let's say you have this domain over here."

"And let's say you have this domain over here."

And... the web has things for that.  They're in real life.

So yeah.  Domains are things.

What does a domain look like?

Because, you get domains "for free" just for having deposited any claims at all.

Domains
Terms
Navigable spaces
Indicator
Affordance


A triple in a context is a claim.

Triple
Quad
TripleStore
QuadStore
