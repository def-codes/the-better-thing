# On Hashtags and other things

## Hashtags

Hashtags are identifiers.

How can you tell it's a hastag? (hasTell)

Browsers provide hyperlink-based navigation for free.

We can interpret the selection of a succession of links in any way that we want.
Browser history is kind of like `stdin`.

## Navigating as creating (prelude)

When you follow a hashtag link, the *default* behavior is to scroll to the
element bearing the hashtag as its name.

This default applies only to the already-used names of an already-existing thing
in the graph/model.

What user agents do when the anchor link does not exist, is undefined as far as
I know.  It seems to me that navigating should visibly create another context.

Once we know that a `Carol` exists, we can make statements about whoever `Carol`
may be, with no ambiguity about whom we mean.

Situated links can act as little factories.

They can suggest a path forward.

There is a straight line from this to boggle solver.

## Context drives the representation of the thing... but not the thing itself

## Assertions - Facts - Propositions - Claims

They all mean the same thing: you're telling me something is true.

But regardless of the term, note the difference with calling them "Truths."

“Assertions” beg for a challenge, and “propositions” are dubious beasts.

"Facts" approaches the presumption of authority, although I think it's fair to
say that "facts" are now officially undecidable by default.

Anyway, I tend to use the word "claims" for this class of things.  It's almost a
short as “facts” and conveys the propositional nature without scare quotes.

## Values

Cohabitating the world with "claims of truth" are things called "values".

Values are of no consequence.  They have no strings attached.

Representations of values can be navigable, by containing links to other things.
Values can thus serve indirectly as (the locus of) inflection points in a
sequence (of navigation).

## Identifiable - Identity

Resources are Identifiable.  Indeed, we cannot talk about a resource without
first identifying it.

Values are not Identifiable, though they are Comparable.

Identify is seen as in Clojure: a succession of immutable states over time.

## Comparison

All comparison is value-based comparison.

## Claims and values are mutually recursive

Claims and values are siblings, they are both children of "data."

Claims can include values, and values can refer to claims.

The difference between “claims” and “values” is that truth cannot be imputed to
values *per se*, i.e. they have no truth value.

## Claims extend values with predicates

Interpreters must recognize a value versus a claim.

How can we *tell* it's a claim?

Claims are also values, and they cannot change the semantics of what values say
is true about their subjects.

## Claims and interpretation are symbiotic

Anything (in MELD, anyway) can be represented as a value, including claims.

Values as such are limited to value semantics.

There is no sense in “interpreting” a value.  You can interpret a statement.

MELD of course is based on statement-oriented interpretation.

There is no such thing as a “command”.

The implied imperative in MELD is to reify the assertions of the model.  “What
would it look and sound like if these things were true?”

It won't always be possible to simulate a model's assertions.

But you can see what's in it, since it's a value.  You can see what things have
implementations.  You *could* know which rules that they had come from, and in
turn which named graph (when such are).

What sort of statement would cause a one-time computation to occur?

And when would such a thing be preferable to a reactive expression?

And how would the computation get connected to a representation?

And how would those things remain unaffected by later assertions?

And how do you represent the expression?

Do you give it a name?

Still, what urges its evaluation?

Clicks on links could reify their targets, as noted elsewhere.

(With claims pre-made, though, or made parametrically?)

Also give me one example of a computation like this that you'd want to see?

Increment.  That's an easy one.  It's available wherever numbers are sold.

There's all kinds of “things that you can do” with something, even with a value.
Suggestions can pair the value with operations where it would fit.  A UI could
preemptively make and show some of those results, if it could preview them
putatively without claiming their existence.  That's what p-h does.

How would you see that monotonically?  As if the suggestions on the result had
produced links to content that you would compute dynamically.  That a link
describing a function application affords you a way to reify it.

It doesn't have to be a single computation.  It can be a multi-step process.
It's just that the process can die.  For streams, that's being done.

Note also.

Elements contain attribute dictionaries.

Could you match on attributes of elements?  Well, you can do that in CSS.

But reifying attributes isn't our mission.  Attributes are invisible by design.
And we have DOM inspector for that level.  Still, if you datafy the thing (the
dom tree), you can see the attributes for what they are (a dictionary).



## DOM for tree representation

It's only natural.



## Representations can linger long after the death of its main process

See “processes die”

## Things-in-themslves - the inherent authority of supertypes

Semantics-driven transformations made at higher abstration layers must not
obscure the value-nature of the underlying supertypes.  How is that possible?
By constraining the algebra of trait-exhibiting transforms to a set of
conflict-free operations.  That is, a family of terms where contradiction is
impossible to state.

## Domains as challenge arbiters (i.e. authorities)

Instances almost always reside in a different domain than their types.

How much of a thing's representation can the owner of those domains claim?

You must always be able to look at things at a lower level of abstraction
(preservation of semantics of supertypes).  In which case other domains may have
stronger precedence.  There must be a way of weighting this, too.

Yet, in *your* domains (including all local, ad hoc namespaces), you must have
some precedence.

Similarities to CSS (stylesheets < inline < user agent)

## Planar forcefield arbitration scheme

Idea: 

For one or more scalar properties, let each be represented by a body in a (new?)
forcefield.

Let each of a set of resources be a body in a forcefield.

Let the interested resources assert descriptions of forces on the placement of
the bodies that they claim exert on the represented property, in any given
context.

The domains thus arbitrate not by making simultaneous claims about a specific
amount, but by way of claims about the determination of its value in any given
context, where it coexists with other such claims, and not one of them precludes
another.

## Simulation as a domain

Space
Body
Forcefield

`FrameSimulation` is `Iterable`.

`Iterable` is stateful

Let the successive states of the bodies in the space be an iterable dictionary.

Monotonicity.  Extension.

It is a function of the simulation ticker.  Simulation ticker is a functional
property, as the simulation can only have one ticker.  The simulation is
stateful.

We must interpret them as the properties of the bodies representing the things.

## Representation over reference

When representing things whose terms come from "other" namespaces, you must
refer to them in some way.

This is a bit like value over identity.  Let the thing speak for itself, let me
not take it on authority.

## Conflict prevention

Contradiction, as you probably know, has drastic consequences for the outlook of
a language.

Prevention is the best cure, as usual.

Prefer *open* semantics.  Design families of terms in a way that precludes the
possibility of contradiction.

## Conflict mitigation - Optionality over requirement

Despite our preventive efforts, some conflict is unavoidable.

Conflict is a tax we can pay to secure a greater expressive range,

Example where conflict is worth it.  Negation -- right?

Conflict has consequences.

Conflict may also be *unresolvable*, which may have consequences.

Preferring *optionality* over *requirement* mitigates the consequences of
conflict.

Goals with subgoals mired in conflict may decide that the juice is not worth the
squeeze.

If your member's goal was not a *required* input to "your" goal, you can carry
on with your claim, as far as we're concerned.

An optional goal is a body in a composition, where the composition is a pattern

How is an optional body depicted in a pattern, and a match result.  A match
result extends a pattern.


## Conflict resolution (dup)

Some operations may allow parties to impute contradictory claims.

If a conflict arises in the course of a goal, that goal remains unattainable as
long as it is blocked by an unresolvable conflict.

One consequence is that the activity being undertaken at the time of the
conflict will likely fail.

## Disjunction

A *disjunction* divides one or more classes from others.

Disjunctive statements require negative assertions.  If you want to say that
Alice and Bob are *different* people; i.e., you can't be Bob if you're Alice,
and vice versa.

## Negation in RDF

RDF lacks a first-class notion of negation.  We cannot directly say, "Alice is
not Bob".  But we can imply as much by adopting ontological terms, whose logical
consequences are formalized as _entailment regimes_.

Physical bodies are spatially *disjunctive*: they cannot occupy the same place
at the same time.

## Universality of physical properties - our need to exploit it

Negation introduces a new level of complexity.

Computational complexity has direct consequences for the capability of a thing.

What keeps them from doing that?

Yet physical bodies are *disjunctive* without making negative statements
involving each other.

They do it naturally.  It is in their nature as solid bodies.  That property
comes from a much lower abstraction layer than our typical discourse.  That is,
we don't think it a special property of a thing; it is accomplished through no
power of its own, or at least no power specially its own.  It is certainly not a
distinguishing trait of any kind of thing, a la: Cats are feline things that
can't occupy the same space as other things; Dogs... etc

The universality of physical properties must be exploited as having descriptive
power in abstracted contexts.
	 
## Rights of domain owner over representation

We will want to make claims about our things --- to make them appear in
different forms.

When other domains refer to our terms, we want some say over how they are
represented.

But if an implementation is able to verify the integrity of a resource bearing
claims about that domain's manifestations, then it must give priority to claims
coming from the domain in question, all in matters of dispute then defined.

(Note that verifying the *authenticity* of the resource content does *not*
entail verifying any claims it may entail.)

This, a term's home domain can take precedence over other claims in certain
situations.

The only precedence relationship is also a predicate
- is it in your domain or not?
- i.e. in what namespace are you claiming this?


## The further impossibility of impossibility

Even “conflict-free” composition does not create guaranteed invariants.

Even in the absence of contradiction, we cannot for example, make a rule
asserting that all things shall be visible.  We *can* say, "For all Things, that
Thing has a Representation," and find words to express the proposal that the
representation should be ever faithful.  But invisible in that claim would be
its author's ignorance of the existence of a viewport, where duly-represented
things can become occluded for reasons quite alien to the rule's upholders
(including their representatives), which of force know nothing of their outer
context.

## Polymorphism

Polymorphism is *situational response*, the sometime province of man.

We must be polymorphic to read this.  We can treat these ideas with a kind of
abandon for the "real world" that would not suit other modes of activity.  We
are able to read into the relative peace of our community, that we have a moment
to be together, to speak peacefully.

Things are polymorphic in that they are handled by other things in different
ways based on their characteristics.  And every time you discriminate one type
of thing from another, and treat them specially, you are polymorphing.

## Single dispatch has a point of view.

With spec-conformance and tagging functions, single-dispatch polymorphism can
discriminate on an open set of complex predicates with global names.

Still, the targets of polymorphic dispatch only know what they know.

In a realm of directional subject-object propositions, subjects do not "know"
all that is claimed about them in a knowledge base.

## Generalized interpreter context

What if the interpretation of a term could also consider statements in which its
target is the *object*, not the subject, of a claim.  A typical target would
have no way of knowing many of these.

Further out, we could identify traits whose essential qualities are only
"adjacent" to the subject, and those traits may be contagious.  Why would we
want contagious traits?  Because they're super interesting to play with.

The fact that we have this subject-oriented point of view is an artifact of the
dispatching model.  What is the "point of view" when anything happens?  What
kinds of things can happen?  Messages can be interpreted.

## Graphic polymorphism

While dispatch on arbitrary composite values is powerful, it is by itself too
situated to serve as the basis of traits that exhibit contextual awareness.




## Macro expansion

Indeed, there are few good reasons to favor one group of things over another
based on a description of their characteristics.

## Representation

The realm of values non-propositional world.

Once a thing is being represented, we enter the Pure Data world, the realm of
ideals.

Is the pure-data world hard-partitioned from the resource world?

No, it extends the pure data world.

But the pure data world can name resources.  And those names can be treated
specially when considering premises.  Including the distinction between, say, a
named node and a variable.




## The value realm

Claims are also values, and may contain values.

Navigability between value and resources is achieved through the unifying
lens of a of datafy-nav cycle.

What are the tells of a value?

- They have no default interpretation as predicates.


## Navigation context - navigation

Terms can identify anything.

If the user navigates to a term, we look from that term's point of view.  And
what should we see? Representatives.

We should represent the world as from its point of view.  When we're in
agreement, we can knock out our contradictions.

Within structures where this thing is represented, this term, this triple,
remains in the navigation context.

Likewise, as long as we remain on a path through that resource, it remains in
our context.

## Navigation as creation

With the open-world assumption, you can't talk about non-existence.

Navigation creates a subject from what was an object.

We can write links to things that don't exist, users may follow them.

We can talk about things that don't exist, or don't exist yet, as far as anyone
around here knows.

To the extent that those links describe a thing, we can create it if it fails to
match the name of a thing we know.

We represent the thing in data form, only what we've heard.

## Shadow profiles

We can build our own "shadow profiles" of things.

Indeed, we do it all the time.  Our mermories are shadow profiles---mental
representations of a thing.


A shadow profile can be created with context, because there may be statements
*about* X already.  Even if you assume all subjects in a graph are given a home
(in the document), there's nothing stopping you from linking to such anchors.
In doing so, you can make a simple hashtag link a creative tool, since you can
capture in that link a lot of context.  Patterns seen in that context serve as
the basis of "graphical" polymorphism.  The tools to implement this are
available and simple.  The challenge is devising a language that can exploit it.
I argue that RDF must be the substrate of any such language with any hope of
survival.

To truly build shadow profiles, we'll need RDF 1.1 Datasets.  Claims that
*directly* originate from the domain in question, should be visually distinct
from claims from other domains.

These traits can be defined in terms of provenance.

Well, the fact that it has any.

## Domain to datafy: DOM Document Outline

View the DOM either "as dom" or "as document," the document outline is also
governed by some rules, which boil down basically to a set of element types,
which work mostly as a subselection.  Though there may be some rearrangement in
there.  Order of presentation is relaxed for side matter (aside, figure).

Content that already exists there,

## Domain to reify: DOM Events


## Domain to reify: simulation frames






## Bootstrapping - discovery - claims - interpreters
  
What do you need to bootstrap the system?
  
Claims.

- The system won't do anything without claims.
- The system is just a claim interpreter.
- It's actor model.  Some actors are interpreters.
  
- Q: How do the actors get there in the first place, though?
- A: By way of a description, which was given to an actor driver.

- Q: And how did the actor driver get there in the first place?
- A: By way of a driver loader.

- Q: And where did the driver loader come from?
- A: The driver loader is the system.  QED

### Another line of questioning

- Q: And who gave the actor driver the description?
- A: The claim store.

- Q: And where did this claim come from?
- A: You would have to check its provenance.

- Q: And what if it has no provenance?
- A: Then it is asserted by the model.

- Q: And how did the model come into possession of the claim?
- A: The host fed the claim to the system.

- Q: And where did the host get the claim?
- A: A graph was loaded during bootstrap.

- Q: And where did the model come from?
- A: Whatever discovery determined.

- Q: And how did discovery know where to look?
- A: Yes, that is the question now

- Q: What was discovery looking for?
- A: Ingresses.

## Initiative

- Q: Why was discovery looking for something?
- A: Discovery's job is to locate resources to engage with, assuming they may
  have something to say.

We begin in a nullary position with respect to action.

We deploy interpreters to incoming signals.

The interpreters may spur us to action.

## Process vocabulary

We can't do anything without processes.

Yet we have no shared, formal vocabulary for describing processes.

I don't want MELD to have a “built-in” process model.

Yet I'm not opposed to a *de facto* (core?) abstraction and implementation.  I
guess if it's recognized in core then it's “built-in”.

What are the main existing process/coordination models?
- CSP (blocking queue mechanism)
- Actor (extend CSP to include consideration of message semantics??
  Interceptors/event bus)
- PetriNet (token-state transition model)
- pi Calculus (?? model)
- Linda tuplespaces
- BIP ontology surveys some of these and others

For a simple vocabulary that can describe useful processes (not dataflows,
but as simple as `listensTo`), what terms would we need?

We would need something like `respondsTo`.  But the range would not be about
identifying the sender, it would be about describing the type of message to
match and how to formulate the response.

What can happen in the formulation of the response?  Nothing, the response must
be a pure function.  It can at most return a description of something that
should happen.

Can we consider HDOM templates basically a macro-language for defining
side-effects?  Or is it just a message type (hiccup/hdom)?  HDOM does
specifically support interpretation of JSON-based Expressions.

## Polymorphism - QUESTION about interpretation “as”

About the “as” part of interpret expressions...  Is it atomic?  Is it part of an
options map?  Can you specify/request interpretations it in a way that allows
matching on broader context (not “as X”).

Describe these contexts for me, and I'll answer that.

## Interpretation as content-type negotiation - example - frame simulations

We can interpret frame simulations as sequences, but a frame simulation is not a
process.  It requires a process, to be iterated.  That is, we can interpret a
frame simulation as a process *indirectly*, because of a polymorphism that
resembles a content-type negotiation: we can accept a Process, and the server
has an iterable and a thing for Processifying iterables.

## Processifiable

Revisiting this protocol in light of “everything is interpret-as”, or even more
broadly.

## Channels are Processifiable

We say that a thing can be “interpreted as a Process” if some registered
mechanism matches its description.

We already have this for (pseudo-)RDF resources, by way of driver rules.

So `DriverRule subclassOf Interpreter`?

They must be considered Processes, because they are enqueued invocation targets.



## Context access

The intent is that protocols (in a blessed or otherwise default namespace) can
be referenced by presumption of a term in a callback context.

```
({show, Keys}, subject) => [show, Keys(subject)]
```

We are interpreting the term as a protocol.

Undefined terms are largely ignored.

Determine whether the target implements the protocol.

If not, do nothing.

If so, dereference the protocol from the global registry using the
now-available local name.



## Render is still a synchronous, terminating function

In contained contexts, for example, we may show a lower-fidelity view of a
resource than we ourselves enjoyed.  The “charter” afforded here by the caller
to its child is expected to be a diminishing resource, or else the descent would
never terminate.

## Bottom-out operation

We need to bottom out on an element, and yes, there may be conflicts.

Multiple assertions of the same value do not conflict.

Handling of unequal values is necessarily domain-specific.

For HTML, we could classify elements as being more or less specific.  (**making
stuff up**).  A simple rubric would resolve most cases (e.g. `div` and `span`
are 0 points, everything else is 1 and up).  (For svg, `g` is the zero-point
container.)

## Viewpoints

- subject viewpoint :: subject + predicateList/JSON-LD object/Describe/Dispatch
- community viewpoint :: N-Triples/JSON-LD @graph/Construct/Announce

## We are processing claims. All day.

Basics:

We identify something called *models*.

A Model is syntactically expressed as an RDF triple store.

A Model is a community of claims, made in unison.

New claims enter the community generally unbidden.

But we accept them all as true.

## *De facto* protocols

- Keys
- Values
- Entries

Mostly implemented already, but not QUITE uniformly.


## Discoverability of protocol implementations

- Are protocols reified?
- Are implementations?
- If not, how are they discovered?
- We must determine how each item best fulfills each protocol


## Typify protocol

Not exactly like classify, but to provide a prototype via instance.

But in a concrete world, all instances are prototypes.

There would be no need for such a protocol unless templates could speak for
instances.  Then an instance may demand the right to more direct representation.

## Fish browsing

The element is a given.  That's how interpreters are cherry-picked.

Does that mean that something doesn't get shown at all unless there's an element
matching one of its effective types?

Yes, but, all elemental things have elements.

What would be the effects?

The effect of saying that things would not have an overarching default element,
and that unless the rules specified one (which they can't because they are
conjunctive and mutually ignorant), would have the effect of driving things
towards the physical types.  Towards claims that they have such and such traits.

A *tell* is a trustworthy claim that didn't need to be made.



In a DOM environment, the elements are those of documents.

Luckily, everything the system knows about has been turned into data
(“datafied”).  And data has a few fundamental elements.  Fewer, indeed, than
documents.

As with browsers themselves, a MELD system can have its local preferences
asserted in the usual way.

But some semi-official defaults may exist in the form of built-in mappings.

## But how do you start from element?

first you don't want it
now it's first-class, with children

A poem about element.  I wanted to be agnostic about it because I didn't see a
non-conflicting way of asserting it, such that we could replace the default
behavior.

But you must say, about what node are these assertions true?

Most of them supposedly have semantics.

Moreover, they mean things in the domain of documents and applications.

Or let's say documents and spaces.

So the natural pairing between HTML element names and semantics that map (more
or less) to some term naming its Class.

A class to which anything may belong.

There is nothing stopping you from making any claim about this class, nor from
asserting that any of “your” terms, terms from your domain, belong to that
class, are instances of it, and even extend it.

Keep that in mind when setting up terms for territorial fights over treatment of
element.


## bootstrap - chicken and egg

- what's the (top-level) subject?
- the system, or a model?

- if the top-level topic is handled by giving it to the system
- then "system" as the top-level topic necessitates reflection
- meaning we must reify the System

## how late binding

If "templates" or let's say “s-expressions” get late-binding protocol references
from the context

(and when do they)
(and what is their execution context)

and claims define those protocols

(because how else does something become true)
(and the protocol extension is a composable claim)
(so why wouldn't you want to reify it as knowledge)

Anyway, don't these two things together (late-binding template expressions and
implementations as part of a monotonic knowledge store) mean that all template
evaluation is itself a stream, synchronizing the aggregated claims with what I
can only assume is what we've been calling the recognized interpreters.  That
is, the things we recognize as interpreters.  If all template evaluation must
consider any change anywhere to be a possible upstream.  Execution context.  I'm
dying to get a grasp of the execution context.

And it seems to me that streams must be first-class in any definition of
process.

Describe a process without streams, by which I mean asynchronous streams.
Perdurant stream.  Streams over time.

The store does not reify time as such.

Frequency

Hertz

Names reify Notions.

Chapter II: Results

Execution model seems to be the question.

Evaluation model.

Interpretation model.

How do you understand what's taking place?

And when, and why?

Start with the unrolled sequence.

The unrolled sequence is monotonic.

The value proposition of diffing arises only when we've admitted a large share
of redundant evaluations.

## Small multiples

Are more primitive.  Because we know that they are monotonic.

Small multiples help reify Time.

## immutable representations

Immutable representations can also be useful.

And immutable is how we should treat values.

Maybe in a document context we can edit content, but those deltas are also
(let's say) published as a stream.  The fact that the input could be fed by any
iterable, and the fact that we don't have processes without them... then it's
fair to say that asynchronous streams introduce asynchrony to a dataflow.  But
the dataflow would have some way of being operated through no power of its own.

I mean, the use of a process presumes a processor, and a processor must be a
process.  They are perdurants.  They know the notion of time.  The
non-determinism.  That they will interleave in some way, but that interleaving
is not prescribed by the program, nor guaranteed by the interpreter.

I want the appearance of these things to arise from their properties.  From an
ascription of traits to those properties, by way of a claimed interpretation.

## navigation as augmentation

And those things must be navigable.

To navigate, in a monotonically-increasing view of the dom (whether or not
necessary)

means only to append, to add, to augment.

Why should you ever obliterate.

But you reify these things as you explore them.

Right?

I mean, if navigation of the thing is monotonic
- new things (and their representations)
  do not clobber older ones
- you accrete a representation of a larger thing
  
  
I think my main objection to the idea of claiming datafied objects during
navigation is the fact that I don't have namespaces.  You must be able to keep
claims constructed in that way in a separable, “quoted” place, at least for the
sake of its provenance.  Marking each triple claimed in that way would be too
inconvenient.  But at the moment, let's say I have no objection to the rest of
the model sharing a space with a remembrance of things navigated.

Execution model.

Monotonic

.

Stream

Process

Subscription

Earlier I was getting at the idea that you could “deflate” a dataflow
description by substituting its stream inputs with synchronous sources.

This suggests that such a description is more like inert matter than it is like
a process.

So what combines with a dataflow description to make it not inert?  A stream.

We still need drivers.

But if there are streams, you should see them.

I mean, yeah, like, render all the things.

Like, make the rules of this render as particular as they need to be.

But capture the things that are there.

This is the discovery protocol.

At least, “discovery” sounds like it should be a protocol, and I do think it
precedes visibility.

Is it an execution model?  An execution context?

If it doesn't change the execution model, then it's an instance of whatever
thing the model supports.

From a userland point of view, I still just want to say truths.

Monotonic rendering as more "productive".  It produces more.

And what the transducer does.  Turning it into one.  That becomes a thing you
look for.  It applies a reduction.

Transducers can be classified wrt delta cardinality

- N:1   o-o-o-[ ]-o
- 1:1     o-o-[ ]-o-o
- 1:N       o-[ ]-o-o-o
- N:N     ?-?-[ ]-?-?

I don't know mathematical names for these classes, but they can be understood
intuitively as shortening, lengthening, length-perserving, and variable.

HDOM transducer is a lengthening.

What happens to one-time representations after they've been made?

Well, we weren't making any one-time representations.

So about this execution model.

I'm not doing renderOnce as a thing.

I could, but it would have to be in a different execution context.  Not in a
dataflow.

The idea is that it would produce something tangible.  So.  Let's say, you don't
get to make claims exactly, but you can produce artifacts from an artifactory.
And those things can be treated as resources.  I mean, actual DOM elements.
Like, XML-serializable things.  They have a datatype.

The idea I'm getting at there is to “mint” renderings and let them alone for
life.  I've been assuming that representations need processes, but that's only
because they represent possibly growing things.  But we have no similar way of
dealing with inert matter.  You can emit dom nodes "for free".

That is, let's consider it a separate question, as to whether or not
representations require processes.  Let's just say that you still can't make
claims from a dataflow.  BUT that "side effects" like creating dom elements from
templates is okay.  You can also make them resources, tag them with provenance.

I mean, how much rendering do you expect to do?  These things can be recognized
as immutable (by way of necessary protocols), and in general leave it alone.  I
don't see why it couldn't move around.  From one place to another in the
document, from one container to another, I mean.  The claims don't try to
account for the rest of the world.  They just describe the provenance of the
little piece of currency.  It's a scrap.  It's a value.

(*move around.  This could be the case for elements in space as well, if we
allow statements about the things' positions.)

Well sort of.  It's a runtime object.  The DOM has all sorts of strings attached
that we do not want to tangle with.

The system just stores a reference to the element, assigns it a blank node ID,
and says a word about its type.

^ That's a weak set right?

So what kind of execution model would allow you to describe a way whereby a
sequence (of links I hope!) creates a set of independent things.  At any rate,
that is how we would show the growth in a sequence.  I guess what I'm getting at
is that we need execution semantics for something that can
- compute a tree once, *and be finished*
- keep the tree out of the “reforesting” places
- leave other trees computed thus alone
- register the tree with the system as an exotic
  - blank node with type DomElement
  - has value of an HTML snapshot of the node at that time
    - with XML datatype
- not create a permanent ?
- still support update-in-place transducer

Remember, we can do datafy nav of the dom itself.  So we can use the dom itself
to represent the dom itself.

## small multiples 

when you project a representation over a sequence
what changes each time
and why

## some things that believe it or not I still want to be true

Things should be represented just because.

I need to make this kind of rule in userland.

That makes the things feel real in your mind.

That makes them *seem* to have the properties they have.

That's opinionated.  What is essential.

I know that I want to see what's there.

But I know there's too much there to show.

We begin with these rules.

And we'll learn as we grow.

A model is subjective.  A model has a point of view.

A model consists of claims.

A model is interpreted in context.

Is a model a proces?
Is a model an actor?
Can a model take care of itself?
Will it be too much hassle?

An interpreter watches the claims being made in a knowledge base 
and responds

No.  “and” not allowed in job description.

Interpretation entails
- monitoring of the claims being made in a knowledge base
- that is conversant with a set of subscribers
- who want notification when their pattern has matched
- although.  yeah, it's a callback any way you slice it.  dealing with that is
  further down the line

Interpretation entails
- creating something
- from something else
- in a context

I'm asking why polymorphic-hdom has this two-phase thing.

Why couldn't the queries just yield the interpreted thing?

Well, they are functions.

The reason for the middle phase (let's call it the O(1) seam)

The render function is recursive.  It needs a synchronous, subject-oriented
dispatcher that can be given an arbitrary value (and automatically gets the same
evaluation context (from which the recursive function came)).

None of that means that global rules couldn't apply there.

How much of this is driven by the idea that render is a hotspot?

Also, about those standalone snippets.  They can be sources, right?

And they don't need to be in the document.

Even the use-once render function must (at least potentially) be recursive in
that way.

## purview is subjective

Purview is subjective.  When traveling by datafy nav (as render should be
doing), how could you take context into account, without shared query space?

(And a shared form to query.  But that's more accidental.)

Another way to ask this: Why should fewer facts be available during the
representation of an invisible thing, than are available to an onlooker?

ergo, prefer global dispatch.

The second point, that we don't have a uniform query mechanism for values and
for resources (claims).

If we call render again, it *means* something.  It indicates that we're
rendering a different value, this is a different thing.  The slideshow trick
(`updateDOM`) is a way of representing a thing-in-time.

## artifacts and facts

Does all this impetus come from dataflow?  I mean, all these calls?

It comes from interpretations.

Interpreters are first-class in computing.

Interpretations produce artifacts.

Can interpretations produce facts?

This is a difficult question.


## one-time renders

For an ephemeral render, it makes no difference whether the protocols whereby it
took place are static or dynamic: it's not going to be rendered again.  Those
ties are severed.

Now, if you're not using hdom, where does this thing take place?

You're using hdom for the computed templates.  But for a "monotonic"
(non-replacing) system, the point is to avoid unnecessary diffing.  Can you do
that and still use HDOM?  Well there are signals you can send.  For example, if
a subtree has the attribute `__diff__:false` or something like that, we can
leave it alone for effectively free.  But in that case, we're still... in a
diffing cycle.  No, I really want like a new, not-spoken-for
container-at-the-end.

The rendering tool has been `updateDOM`, which is not well-suited to this.

But the goal I've decided is to describe MELD's execution model.  I couldn't
have a notion of processes without that.

## inert things - embodiment - dom as “free” raw material

I like the notion of "inert" things.  Now, you would need a process to “embody”
them, even if their value isn't going to change.

Hmm, perhaps.  But that doesn't need to exist all the time.  Only when the thing
is being embodied.  We can consider existing dom elements to be “raw materials”.
(Though even to behave like raw materials takes some work.)

We could also assume that if some DOM weren't spoken for, or that say it didn't
have some claims as to its content, then the user could update it in place or
otherwise take the thing apart with no harm.  It would need to be embodied for
that.

## execution model

The model is the unit of execution.

It's not that we want the system to say, "you shall see all things"

We want a system where we can say, "show me all the things"

When do we want subjective dispatch?

And how do we define the showing of a thing?

And what do users need to know about the execution model?

Is it a thing, and if so, how do we represent it?

But really: how are interpretations brought into contact with claims?

And is that just an instance of a more general (and not
claim/knowledge-oriented) process model?

When do we want to create a more contained context, where we can make claims
that have more limited scope.

Underneath, it's just streams.  Streams that feed handlers that return
instructions that the system carries out.  One advantage of an interceptor bus
is that, although you need a RAF or something to run it, you can also pull the
plug at any time.

But the system is not a process model we want to emulate for userland.  It's
stateful and managing all kinds of references internally.

A model can't quite animate itself.  It has to be brought into contact with some
kind of mechanism just to accept its own claims.  And at that point we mean, the
system implementing the model.

But... a whole new system per model?

The system is just a fancy triple store, but we also need a specially-designated
global registry, right?  I mean, shouldn't the object registry be in one place?
Maybe not.

## closures have invisible, unretrievable context

Callbacks (even those used by userland things such as rules) are always
contextualized, and that context is not reified in Javascript.  We can't tell
what, if anything, a function closed over, unless we made it from a description
that could be used to reproduce the closed-over things.

## drivers are interpreters?

Drivers just recognize certain patterns in the claim store (though really they
depend on the system for even that).  And then they take some action.

Now, the presumption is that much of what we now do in drivers will be doable in
userland.  The current way of registering drivers makes this coupling seem
inherent.

Interpreters bind descriptions with resources.  But individual bindings are not
subjective.  They can register more than one subject-resource association, and
they can also match on complex criteria where the subject is not central.
Drivers really have no point of view.  I'm thinking drivers aren't really a
thing.  Or that they're nothing more than driver callbacks, and only
artificially belong to groups (until we have named graphs).

## processes die

Short-lived processes are a thing.  It's possible for you to have a process to
represent something, and then it dies, and the fact is still represented by the
associated resources.  New processes that are spawned are represented by new
resources.  Processes can have state.

This makes it seem possible to have another degree of "non-monotonic" dataflow
represented by a monotonic description.

One reason I am so squeamish about using the lifecycles of dataflow objects is
that I can't see them.  So letting them be dead and gone only makes matters
worse.

### example of a short-lived process please

You want to see some computation that was performed.  Yes, reifying computation
itself.  That just because something was computed, that we have created
something.  Several things, as we need to represent the input and the output and
a description of the process they went through.

How do we get these?  And how do we avoid getting them when we want to, you
know, just do a computation?

Well, is it a process when you make a computation?

A single, synchronous, transactional thing, can be computed without spawning a
new process.

But what happens to it?  Is it just detritus?  A side effect?  Console log?
Where does it go?

And how do you make the decision to compute it in the first place?  And how do
you keep them from cluttering up the world?  How do you know when you should be
looking at it?

### example of a short-lived process please




## polymorphism

of functions
in the situation
of reifying a thing

Is there a difference between a function saying that it “knows how to reify”
something of type X, and what we're saying now?  Yes, we don't assert that a
rule either is or isn't about any certain subject or doing any certain thing.

When we talk about protocols, then, we're talking about something different than
interpretation.

protocols !== interpretation

Okay.  But how would we do something like protocol negotiation, where things are
chained together based on available resources?  We kind of already do that in
the form of queries.

```js
        when: q(
          "?subject hasRoot ?container",
          "?element implements ?container",
          "?element as Container"
        ),
```

The difference with content negotiation is that all matches apply.

## Negative assertions considered harmful

The HTML “schema” says that the `<caption>` element, “if used is *always* the
first child of a `<table>`.” (in MDN's words)

https://www.w3.org/TR/html50/tabular-data.html#the-caption-element

Who is served by this rule?  Why can't we put a `<caption>` wherever we want?
Let it be treated as any other block-level element (as I'm sure it would,
anyway).

I understand (sort of) why you can't put arbitrary content between table rows.

The other one is `<dl>`.  It's semantically fit for dictionaries, but can you
group the key-value pairs?

It looks like they are relaxing that rule:
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dd


## Combinations, permutations

And other set operations.

What do they look like?

- How can you tell it's an Intersection?
- How can you tell it's a Union?
- How can you tell it's a Combination?
- How can you tell it's a Permutation?

## symbiotic navigation and rendering

I have this crazy idea.

Every time I've worked just with the DOM, there's one thing I always want to do,
and that's match patterns and say things about other things that they should
have.

I can't shake this idea of a rule set that uses CSS selectors as its conditions
(though could use other kinds of search to get at element representations
indirectly)

and as its consequent, operations basically like what traits do.

These rules would be realized by way of dom listeners.  Those information
streams that light up when you create something.

Activity as luminosity

Cost model for power

I have wondered what kind of execution context could allow you to sustain a
process that would treat its productions as monotonic by default: immutable,
one-time productions after which the summoned thing is *done*.  That instance of
a rule firing occurred.  That costs you something.  How much does it cost to
subscribe to events?  Maybe depends on their typical volume, in practice.  But
we're interested in the cost of the response to a message, not the receipt of
it.  Receiving messages is free.

Anyway, now I am seeing a kind of self-sustaining rule, or maybe pair of types
of rule, where we finally listen to the dom as a first-class reporter of facts.

One objection that people may have had to the use of dom listeners, maybe the
first API implementation was bad, or maybe people correctly view the DOM object
as a dangerous entanglement.

On the “dangerous entanglement” front, (in-place) datafy-nav allows us to treat
the DOM more like a remote.

## draggability

What should be draggable?

Whatever unit is movable when you try to move it.

This should have a hover/gaze indication.

What kind of shift happens when you quote a passage?

Different provenance, different authority.

Also, we can *make* something draggable by asserting it.

Macroexpansion in traits: affect two things in the same way, even when you don't
know what they are.

## indicating provenance

What shifts?

What do you impute to the authorial context?

That the author stands by whatever is there.

Or, that the author can put whatever is there in the appropriate context on
demand.

But the visual signs of authorial context cannot vanish.

Well, everybody wants to not vanish.  To grant an entire channel to one class
would be to create a world where everything, and therefore nothing, has the
identifying property---the “tell” of a trait, told in features.

I mean, what are the channels we have?

- boundary
- focus

Boundary is binary: you're either in or out.  You can blur the 

How is attention manifested?  Persistent trails.

What happens when you nav?  I mean, you don't have to change the whole world's
context, but could you contribute to a fund to push the rest of the world down a
little when you've navigated to a new context.  It “is” a new world, in that the
default subject has changed, and this new tenant of our attention may have
another outlook.

Okay but bro.

Back to execution.

I like the idea

of tapping the change streams in the dom

to feed into selector-matchable things for rule operations

can general consequents be written in terms of our “conflict-free” operations?

supposing that you can use a form of macroexpansion

Show me such a consequent.

Much the same as now, a function that maps a record describing an instance of a
certain identified property (why the single dispatch here?).

For the selector

```
.Draggable > header
```

Assert that there exist the following template applied to the context node.

But really, just transform the referenced thing in any way.  Pitch and catch.

If a thing is draggable, then its header is responsible for maintaining an
affordance to that feature, since the body of the thing may represent a
different space, or be otherwise not-directly-affordable.

As a convention --- not a rule

Things grow in some ways more readily than others.  Head, body, foot.

That navigation should push the entire context down.  That would have to be
asserted globally, right?

Another nice thing about this, you automatically have a css selector targeting
the same set of elements that you match.

That can all be relative to a parent container, although, if nested you'd have
to take care to keep direct relations partitioned.  To limit the extent of the
dom listening to all descendants, that is, except for a child container which
itself operates in this way.

So you've matched a

```
.Draggable > header
```

What do you say in a production way?

You could assert data flows, which you would need in order to implement traits
marked by perdurants.

And those dataflows would never die?

Okay.  No one said that they would never die.  They all very much can die.

So was that always the objection to the notion of assertion from the
dataflow---because it would cause an explosion of processes.  But you can lay
some of them to rest.  You still have descriptions of them.  They still have
records of their provenance and their disposition.

How would you use the stream of dom changes to drive a view of the affected
areas?  Knowing that doing so would only trigger more changes.

Yes, that's kind of the idea.  But yes it does sound like the extension must
occur in the very areas being monitored to match certain patterns.

So for one thing, we can assume monotonicity for the moment.  So we reserve some
way to represent deletions and “changes”, but we don't need that now.

Only insertions and new attributes.

Also, just don't match new things.

But mostly what good would be the stream of dom changes as input?  None, so much
as to dumbly trigger a set of matchers against the context for which browsers
already have optimized paths.  In principle, if you had defined style rules for
a given selector, and then relied upon those selectors at the same rate at which
dom changes occur in a certain child node.  When those selectors match, then you
can say something about that thing.  

(You mean claim, assert into the store?)

The thing you say about the thing, is that in the identified context

(and from a select matched element's point of view?)

it shall have

it shall have parts in its region

but who cares

this must be a special case of a larger context

the more general case where you

hold a truth to be at all evident

let it be

it shall be done

what drives interpretation?

what drives these little stories to blow all their tokens on listeners?

So, we've described the flow of a *trampolining* computation.  Pitch and catch.

Would the trampolining be mediated by the system?

And if not, then how does.... whatever only the system does.

You need a rich set of built-in semantics, that's why you're doing this.  It's
all opinion-driven but still essential in my opinion.

## Reifying section links

Back to hashtags, they are an appropriate representation of a thing.

An identified thing can very well appear so by default, with its id.

This is exactly the kind of rule that you would make^^

Yes, you can fake it with pseudo-elements, but it's not compositional.  Only one
party gets to control the pseudo-element, and the content ranges only over
string.  Now, for id it so happens that's a feature.  And I see nothing wrong
with one easy-to-suppress default---or you could add further CSS-based
composability by creating definitions assembled from custom properties.  Which I
think as encouraging good behavior.  (It's also easy to *override* the default,
just uncivil.)

Anyway, this deals with the more general case.

So.

Let's suppose that you put out a template saying that any thing with an id
should have the following content added (or interpolated?)

--- basically a declarative extension to css.  like getflow

But you have processes and dataflow.

Remember, these rules are _subjective_: they match only a single selector and
they don't report specifically any other nodes involved in the match

## Xpath ftw

But why selectors?  Because... yeah you can use XPath.  Then you can make
multiple conditions, I mean, lots of stuff.  I mean, it would be interesting
just to see like everything else shut down and just look at the effect of a
single semantic on whatever raw material is left.

XPath is closer to SPARQL in power than CSS selectors and still built into the
browser.

There's nothing *wrong* with using CSS selectors.  They're trivially convertible
to XPath but also supported directly, even beyond CSS, for example in the query
selector functions.

But there's no need to limit yourself to the CSS subset.  XPath queries (which
also support variable injection IIRC) can match at oblique and even forking
paths, and could give traversals a kind of "ray" to point around the document.

There is a single context node during XPath evaluation, but the result set is
not in itself subjective.

I want to make a rule that draggable things can stay draggable.

We could adopt the convention that this is done some way by a heading.

So I want to say that some affordance will remain available as a handle to move
the whole body.

I want to be able to say that all draggable things have a "header"

Because I want to be able to say something about its header.

Am I asserting that a draggable thing contains at least one header?

Or am I just asserting “my own” header, where I am from some domain.

This is similar to a variable match in SPARQL.

I also want to be able to see a projection of an outline of the document in some
part of the document itself that is out of bounds for the many watchmen
reporting on various parts of the document.  I don't want to trigger them with
any little old thing.  You got me?

(How best to form such an outline is another interesting question)






These things can live in the document.  They can traverse the document looking
for each other.

But really... how, what?

I'm not really into cellular automata.

So we make some such rules.

That match things already in the container?

Not necessarily.  We may seed the volley by interpreting a model.

Why don't we think of interpreting a model as a synchronous, one-time
calculation?

It must be possible for a model to serve transparently as a stream transformer.

Yes, ports and all.

What is the cost of this model?  Per firing.

Could we really count such?  And wouldn't *that* cost?

## Cost model --- A little TTL

But when does this decrementing get done?

I mean, what makes the message die a little?

## element interactivity

with rules... you can make elements interactive.  Like, a this next to a that.
leads to a such and such, or just some other types obtaining

put a checkbox next to each element with a certain property (e.g. touched, has
it been touched at any point).  One-way properties like that are okay.

Even if you had rules that would cause an infinite overflow, there's nothing
saying that it has to execute *eagerly* and *greedily*.  I think what I mean is
*synchronously*.

It could be not-eager if you required user interaction to advance (e.g. to give
it a token).

Each touch, each tap, each click, gets one token.

You just need a way to automate the tapping---or to tap into a credit.

It could be non-greedy if it could be satisfied with less than an exhaustive
(recursive) application of the rule.

And it would *have* to be asynchronous.  It's pull based, and so would work well
with a cost model.

## push versus cost

For pull-based sequences, a cost model can be applied simply by decrementing TTL
before every pull (and stopping, on the honor system I guess, when you're dead
broke).

Streams are push-based sequences.  You don't decide when you get called.  We
take the view of the stream consumer, that streams are exotic, coming from the
runtime, below see level for even the javascript code.  So while we could charge
ourselves something for receiving these events, it seems better to consider
these callbacks “free” until they need to pull something.






## containment -- opinion

We've talked about various techniques for composition.

^ Linear thinking

We've also talked about how the boundary of composability CSS is extended by the
use of certain custom property constructions.

We've also talked about the order-agnostic, application of template assertions
in matching locations (applications which themselves create new matching
opportunities).  One motivator of these rules is to support the polymorphic
assertion of (representational) traits about multi-class entities.

(sometimes with context, or rescourse to context)

One of the outcomes of all this is to “cram” more attributes into a single
entity: A thing has multiple types.  Some of those types may be related by
subclass, superclass, or oblique relationships.

Meanwhile, the elements used in the representation may have their own semantics.

Consider these element templates:

```
.Thing.Container.OrderedList.Vector
```

*versus*

```
.Thing
  .Container
    .OrderedList
      .Vector
```

(That's what I like about Stylus.)

The first asserts a single element with four classes.  An elelement is not
specified.  Order does not matter.

The second asserts four nested containers each with a different class.  Elements
are not specified.  Order matters.

Either of these might be the consequent of a rule.  The elements could be filled
in with default (`div`), or they could be matched against arbitrary elements to
an existing subtree of the matched context.  But it seems to me that couldn't be
the end of the story.  Could you talk about those things, the created elements,
from a process?  I mean, those particular things?

In cases where particular types lead to particular opportunities (with the thing
“as” that type).  “As a number, you can do this with this,” “As a value, you can
do this,” “As a thing, you can do this.”

You could break that out on demand, though.  There would be no need for that in
every single element.

Aside: In the above example, `OrderedList` is the second-to-last class, and it
is the type associated with the `ul` element.  The `ul` should directly contain
its items, but this uses another general container to represent a special
subclass of ordered list.



## Emacs integration

I mean... wouldn't it be nice?  I could just pick up the syntax tree every so
often, JSONify it, and send it to the browser over a socket.  Or to node over
IPC.

And with XWidgets, you can run the browser right in Emacs!

## Discovery

Toybox dump, but automatic?

## Don't publish

Viruses don't have canonical versions.

If everyone is looking for a thing that doesn't exist as such, it now exists.

The searches themselves are a thing, once they cross some threshold.

What's better, a thing that exists and people can find, or a thing people want
and nobody has?

## REPL

You need to have a REPL.

And your console should produce things.

# dragging things

Browser drag & drop provides userland interop.

But it's a needless constraint within the page.

Only problem: you don't know where the target is going to be.

Touch screens complicate the first one (built-in D&D) especially.

## What don't I like about this?

As a way to proceed.

Well, from what point of view?

It has a low information density.  I don't like that.

## What can we stack?

One path may be to stack the deck a bit more, if we can do so in a way that
leaves things affordable to the touch.

Can we stack successions of sections?  Yes.

```
    .Stack
      > section*
```

Can we stack list items?  Yes.

```
    ul.Stack
```

Can we stack paragraphs?  Yes.

```
    .Stack
      > p
```

Can we stack flow content items generally?

    .FlowContent
      sdf

We *can* stack them, but these are not yet rules.

Still more generally, what are 

## What keyboard commands are dealbreakers?

I don't like the document enough to compose in it.  For that, I still come here.

On the PC, I don't even get home-row navigation.

Beyond that, there's

- `backward-kill-word`
- `kill-line-or-region`
- `backward-sentence`

Can you ever get Emacs levels of userland function from a small javascript
kernel?  Other than by bootstrapping lisp?

ClojureScript is lovely, but taxes portability.

