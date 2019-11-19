# MELD

The definitely-not-final frontier.

## Expressions

We're not trying to support arbitrary expressions.

This and all variants on the proxy-based expression reader (such as the turtle
variant) are purely for expedience and don't represent anything essential.

What is the target for this experiment?

That is, in “default” MELD environment?

Much will depend on what terms are predefined.  But it's also about DSL's.

This can run in node or the browser.  I tend to imagine it more for node, but
it's really not.  The only difference is in what kind of things are available.

This is thingluage.  Thing+language.  Thanguage.  Whatever.

The language is intended as a way to define little *things* that exhibit some
kind of characteristic, which can be replicated.

What can we say about things?
- a thing can be identified (given a thing, you can get its unique name within
  the system)
- a thing can be addressed (given a name (or perhaps some other form of address,
  such as a creation path), you can make a statement about or involving a thing)
- a thing can be named (you can decide the name of a thing you create)
- a thing can be labeled (for display, like rdf[s?]:label)
- a thing can have properties (with global or local names and arbitrary values)
- the values of a things properties can also refer to things
- a thing can entail other things, conditionally or unconditionally
- a thing can be replicated
- a thing can communicate with other things
  - how exactly?

Things we need to talk about in the thing domain.
- make rules of some kind
- pattern matches
- define entailments
- access the pre-existing things
- describe how things are notated
- define dataflows.
- define little state machines.

The rules of thing language:
- every time you assign to an (unresolved) identifier, you're defining a thing
- 
- 

This leaves undefined:
- how the RHS of assignments are interpreted
- any expression not in an assignment, i.e. statements
  - property access
  - invocations
- would these be interpreted as anonymous things (i.e. blank nodes)?

There is no time in thinguage.  At the top level, it's strictly declarative.

## other points

Remember that the whole thing is a scope, a system, which is a thing.  What
applies to things should apply to it.  That is, you should be able to take the
"whole thing" and see it as a kind of component.  It's a process, it can have
states and ports of its own, etc.

## questions: essence and entailment and communication.


### how do you talk about what a thing *is*?

Not everything can be delegated to properties, or something else.  In
particular, how do you talk about an ingress?  Timers are the simplest cases,
but you also have servers, sockets, watchers, etc.

### how do you talk about one thing entailing others?

And what do you mean by it?

What complicates this is the idea of conditional (or otherwise transform-based)
entailment.

### how do things communicate?

I've said that this is by things asserting that “a listens to b”, where `a` and
`b` can be any location in the system.

But how do they make those assertions?  How do they know what to refer to?

### how do things replicate?

