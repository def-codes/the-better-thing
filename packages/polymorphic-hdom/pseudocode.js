// what does a queue look like?
// also, what traits does it have that *processes* can represent?
// indeed, we are talking  largely about static traits here
// things that are true of snapshots
// I mean, don't you want to assert the existence of resources?
//
// well, you can do that via ordinary rules
// ∀ ?x ∃ ?y such that ?x.hasPart.?y and ?y.a.Frob
//
// I mean are you just doing HDOM or are you creating a thing?  well you've
// created things, but the thing has to look like something at some point in
// time.  that's what this is about.  it is re-evaluating the traits each time
// at each point.  which seems redundant but should mean it can be dynamic.
// note you can use linked data to traverse through resources that may not exist
// in the knowledge base as such.  and what good is that?  it means that you can
// display the fabricated results of datafy/nav against things that aren't (yet)
// stored/claimed as facts.  In other words, this should let you view your
// traversal.  And how do you want to view your traversal?  also, how do you
// make the traversal happen if you can't interact?  You can make a navbot that
// scans through the paths.  you know.  like boggle.


// a selected thing (is wrapped in / has) a selection indicator
SelectionIndicator.wraps(a.Selected)

wraps.inverseProperty.wrappedIn

// term should indicate term type (named node, blank node) in metadata (attribute)
$term.a.Term
$term.shows(termType)

// named nodes should link to their IRI (with caveats)
$node.a.NamedNode
linksTo // shorthand for assert attribute dictionary?
$node.value

// named nodes should use active prefixes when applicable (TBD)

// variable nodes should appear with question marks (as placeholders)
$var.a.Variable
prefix / before
"?"

// blank nodes should appear as anonymous terms... (avoid showing node id)

// literals should appear as values

// triples (separate topic) should appear as s -> p -> o
$statement.a.Triple
shows(subject, predicate, object)


// set should appear as enclosed in braces (like the mathematical notation)
a.Set
WrappedIn
Braces

// support CSS/plain text
Braces = wrap(content => ["div.braces", ["span.left-brace", ["span.text", '[']], content, ["span.right-brace", ["span.text", ']']]])

// set should show item count
Set.subclassOf.Collection
Collection.shows.collection$count // size.  via collection interface

// set should show some members
a.Set
shows(first(3))
[one, two, three]

// set should fit to container

// set should indicate that it's a set even when it's empty
// This I think is covered by the curly brace wrapper
// But there should also be a base container saying the type in attributes

// set should indicate that it's a set even when it has no room to show members
// ditto

// set should not show in excess of 50 members
// let's just not enumerate the thing by default

// show "more" in details?


// dictionary should show item count
// dictionary should show some key-value pairs
// dictionary should fit to container
// dictionary key-value pairs should have arrow pointing from key to value
// dictionary should not show in excess of 50 key-value pairs
// dictionary should indicate that it's a dictionary even when it's empty
// dictionary should indicate that it's a dictionary even when it has no room to show members


// vector should appear as enclosed in brackets (like the mathematical notation)
// 

// vector items should appear as distinct (you  mean some space between?)
// generally, use flexbox

// vector should show item count
Vector.subclassOf.Collection

// vector should fit to container
// FLEXBOX!
// though this means children have to participate
// absolute positioning is for space only

// vector should not show in excess of 50 items
// vector should show both head and tail when elided
// vector should indicate elision when elided
// vector should indicate that it's a vector even when it's empty
// vector should indicate that it's a vector even when it has no room to show members

// GENERAL

// a resource has a container
//
// ^ how do you make this baseline rule so that others can advise “its” box?

// TEST RESULTS

// a function test result contains its name

// a function test result is collapsible

(({summary, details}) => ["details", ["summary", summary], details])
// ^ where does that come from?

// a function test result contains a passing indicator... always, even in the summary
a.TestResult
shows(passed)
