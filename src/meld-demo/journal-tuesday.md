# Tuesday

## article - context

The article element is about context.  It can be taken out of context.  Mostly.

An article is a unit of context.

An article is a unit of provenance.

## from html

We are used to these local clicks causing these global shifts (in the www bar),
that is, one little finger gets to decide where everyone else goes.  But about
this representation that has garnered our attention---let us extend our visit
*in-place* a bit, by summoning some sign of what-if statements, then we have
some public document of the visit, and maybe enough linkage to go on likewise
from there.  Who knows?

If absolutely positioned, these new “stepping stones” would generally end up
occluding other views.  But the details can always be retracted by toggling the
state of the `summary`.

Persistent popouts with open/close affordances.  Made possible by your local
datafy/nav.

I don't like flyout menus when their presence depends on mouse position, but
these are stateful, and they're FREE.  As a direct result of their exploitation
of the semantic for which they were designed.  So yeah, I like summary/detail.

Now.

What view of the world would lead to more natural utterances of *those* claims?

Well, you can write summary/details directly.

Summary/details defaults to the “open state”.

As for curtailing its excessive growth, I see it as world construction.

Draw it.  Draw a context tree.  “Manually”

I've now described the workings of such things, but failed to implement them.

## cheap view / expensive view - cost as execution model

You're spending

You know you have a limited amount.

The computational cost of things is something we could and should know something
about.

But how do you aggregate computational cost?

Processes that may execute in different ways.

Anyway, it should be a concept.  If you have to trust labeling, whatever.  Shame
on you.

But we have to have a way of talking in terms of computational cost.

Because this could be a way of naturally bottoming out these excursions.  Use a
cost model in the traversal.  You only get x time or iterations.  So I'm only
going to see your first page of results.

We'll drain your queue x number of times.  But you'll communicate with us in
terms of:

- you tell me when you need work
- I take from your queue

CSP reifies work in a way that dataflow doesn't.

Yet streams are intuitive, as are confluences and distributions.

Only one problem: push processes.  Wait are you telling me push processes are
not going to be queued?

In other words, you take calls on-demand.  You answer the phone when it rings.
That's the subscription model: “real time”.

Let's define “in time” as one type of thing(not “real time,” which is a term of
art for something much more precise).

“buffered” is what you'd call the other kind.

“in time” *versus* “buffered”

It's intuitive to think of reactions to things as happening “when” the
triggering action occurred.  (Let's stick with the idea of definite causality
for now.)

From a modeling perspective, it also seems intuitive that we should be able to
make something happen “when” something else happens.  That's a rule.  As long as
you can describe a happening.

CSP lets you do that, too.  It's called a rendez-vous.

Should this kind of thing be in the domain modeler's purview?

How would we describe the execution model?  Well, if we have to, we're lost.

Is dequeueing really more intuitive than transmitting?  No.

So we have a notion of “in time”, as well as a notion of buffered time.

### How does the cost model work?

#### And how do you apply it to things whose execution models you can't explain?

It's not that cycles are sanctioned, exactly.  But we only want to run one RAF.
Right, that's super not-cost-model.  The idea that you'd just pile all comers
into one call.

The cost model presumes that it can be enforced.

The cost model applies to the activation of processes.

Parent processes can give child processes more cycles.  Where else could they
get them?  Hey, it's a free market, baby.  But truly, we need things that
economize cycles.  We won't get that *now* because we'll be iterating on it with
an inefficient emulation.  But it'll get us to the next thing.  Without a loan.

There are already people who make bots to do various things.  At least, I hear
about this kind of stuff all the time.  How do these things interact?  What is
their protocol?  How do they communicate these intents, and travel through
systems and networks, etc?  Same with graphics for games and movies.  They must
be using more efficient tools, or have a better model for iteration.

But how does the cost model *work*.  Yes, work is the keyword.

Define process.  I dare you.

But suppose we're defining process, and I say that it's about the depositing of
tokens and the consequences thereof.  You'd say, you've been reading about
PetriNets again.  Keep your nose out of those things, they're TRASH I tell you!

PetriNet is a process formalism whose world consists of a graph connecting
places and transitions.

Basically, it's the execution model we already have.

## no await, no yield in userland

I don't want to see `await` and `yield` in userland.  Something's wrong.

## a use for CSS variables

We can further decompose some rules and make others interesting.

For example, instead of saying:

```css
  background: rgba(0, 0, 0, .5);
```

we could say

```css
  background :
    rgba(
      var(255 * --luminesence) * (--luminesence-red),
      var(255 * --luminesence) * (--luminesence-green),
      var(255 * --luminesence) * (--luminesence-blue))
```

and then define intensity.

Multiplication between 0 and 1 composes.

Definitions of “custom properties”, as they're officially called
- can use calculated expressions
- obey the cascade

In other words, you can use selector specificity to modify a *formula*.

formulas can account for various factors and those factors are in turn
influenced by domain semantics from heterogeneous contexts.  Remember, if you
make these chained element trees (as described and never implemented!) you'll
have deep context in the form of descendant and child selectors.  And all that's
FREE!

You can add refinement to the definition, to add to the definition in different
contexts.  I mean, is that how it works?  That you can set a variable to another
expression?  I mean, can you do that?

Yeah looks like it, even units.
https://googlechrome.github.io/samples/css-custom-properties/

### Execution model and the unbearable lightness

Note that
- CSS rules are not reified and far from it
  - but API's could suffer prototype extension for navigation
- well-behaved traits target variables (custom properties), not built-ins
- and mid-level declarations aggregate them

For “free” UI (or what should be free):
- put userland affordances on all ratios
  
CSS rules let you say, when this thing is this way then it should look this way,
including state selectors (:hover, :active, etc).  This never contravenes the
rules.  If you can make rules contingent on (monotonically-matched) state
values, then models can make non-contradictory statements about open sets of
states, cumulatively.

Like, the force simulation would say that in frame X your positions were such.
And you can travel through time by sliding the parent class.

I mean, yeah, the things have to roll off the bottom at some point, but.  You
buffer fifty or a million or whatever.  There's a cost model there, too.

IN all this time
the river flows
endlessly
to the sea

If I had my way
I'd ____ for the river?
Father if Jesus exists
Then how come he never lives here?

