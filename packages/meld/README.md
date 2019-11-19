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

## Invariants

The actual system and things do not require proxies.  The whole
reader/interpreter is just syntax that constructs objects that could be
constructed directly.

Structurally, a thing appears as an object in which every property (or at least
every enumerable property) is an entailment.

All things are entailed by exactly one other thing (except the root).  No
cycles.

Each thing *itself* has
- embedded system reference (what does embedded mean if the thing is not a
  proxy?)
- creator (or path + system ref)
- stdin (message sink)
  - this is what's connected when it's the target of IPC
- stdout (message emitter)
  - this is what's connected when it's the source of IPC

Common thing properties:
- rdf inspired
  - id (global?)
  - type(s)
  - label
  - comment
- meld-inspired
  - state machine spec
    - and associated state
  - error channel/state
  
What's missing here?

Somewhere the thing has to be able to like, handle messages, right?  That makes
sense in some cases (esp like interceptors), but not for like, self-contained
things.

What about things that aren't like subscriptions?  Like the websocket server.
It still has to do something with messages (like to close).

What about messages for creating new entailments?

What about collections?




## the system is a thing

Remember that the whole thing is a scope, a system, which is a thing.  What
applies to things should apply to it.  That is, you should be able to take the
"whole thing" and see it as a kind of component.  It's a process, it can have
states and ports of its own, etc.

When you write in this context, you're creating a description of a thing.

When you define something in that (direct) scope, you've created an entailment.

Think of an object where every property (that's visible on the interface) is an
entailment.

That doesn't mean that each property must be a thing.  Properties can have
values.

What if you want to set a property to refer to something in another scope?  In
that case, it's not entailed and can't be treated as such.

In that case, we would need a way to distinguish, but note that we are still
entailing the *fact*.

But it may also be that such references are not in scope.

Or.... that kind of assignment is an implicit "listens to".

Mmmm... sounds nice, but it's also dicey.

Yet... you'd be doing the same thing when saying x = y.map(f).  There's just an
extra (sub) thing implied.

Right, but that's an internal.  Still, it would be the same as saying
resolve('/some/thing').map(foo).

And you have to be able to tell what something "is", like, to get a
(not-exactly-thing) mechanism.  *Those* things are not supposed to be extensible
as such.  Things wrap around them.

FWIW, the system can tell the difference in this context.

What does the result look like?

What if you make multiple assignments to something?


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

