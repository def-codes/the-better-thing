# Towards a dynamic, composable, polymorphic approach to rendering things

“hands-free” description of what things look like

not entirely declarative.  can use power of host language (currently)

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
