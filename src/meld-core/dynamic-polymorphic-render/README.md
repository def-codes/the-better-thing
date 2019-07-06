# Towards a dynamic, composable, polymorphic approach to rendering things

“hands-free”

## Goals

talk about both values and resources?  or first convert values to
pseudo-resources? (JSON-LD-like)

open-world: independent, rule-based assertion about aspects of things'
appearance

compositional: allow multiple rules to operate at the same time on the same
things.  design vocabulary to avoid inherent conflict

dynamic: operation takes the rule set as input

polymorphic: use powerful query/selection and knowledge of ontology / hierarchy
(where conflict resolution necessary)


driven by vocabulary / semantics from domain of structure and appearance

separate selection and rendering

## Terms

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
