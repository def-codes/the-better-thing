# GWT rules

## introduction: GWT rules _versus_ GWT tests

Not to be confused with Given-When-Then _tests_. See Fowler & a thousand others.

GWT tests are instructions for verifying truth conditions:

- **Given**: some context G

- **When**: event X occurs

- **Then**: Y should be true (regarding X)

A GWT test runner interprets this as:

- Arrange a world so that G is true

- Cause event X to occur

- Non-destructively assess whether Y is true (of X)

But suppose we took the same expression and read it “the opposite” way:

- Whenever G is true in the world

- Wait for event X to occur

- Arrange the world so that Y is true (of X)

Interpreted this way, GWT expressions can be understood as _handlers_, rather
than tests.

Suppose we make one more small change, where instead of being an event, X is
understood as a predicate (proposition). Now we can interpret the “when” clause
as:

> whenever X is true

(as opposed to “when (event) X occurs”)

This interpretation is what I mean by a GWT “rule.”

The point is that until we can get _all_ of these things—GWT test, handlers, and
rules—from the _same expression_, then we've fallen short of their potential.

I have not studied BDD, but I assume it's about writing GWT expressions so that
they are open to these more powerful modes of interpretation.

## protocols

### ask (is / has / match)

Even in the “weakest” form (verify only), GWT provides a kind of knowledge-based
interface to a running system that we do not always afford ourselves. One would
expect such queries to be first-class for both the user and the developer.

In the most common interpretation of GWT (as I understand it), the “given”
clause is by far the most powerful one, because it can arrange the world to
satisfy arbitrary conditions.

Of course, these “truth maintenance” handlers must be implemented specifically
for each type of expression. That is to be expected in most domains.

Suppose we extended GWT into lower-level domains, such as processes, messaging,
and data types. It's a worthwhile thought experiment, anyway, since it forces us
to consider, what can we actually say for sure is true about these things we use
all the time, like processes and coordination?

In principle, there is no reason why the “arrange the world so that X” form
could not be used for lower-level software mechanims, such as processes and
communication channels. Surely someone is doing this already.

Depending on the kind of match that you make, you may be able to partake in
different protocols using the result.

`ask` is implemented against stores that support query or matching patterns.

it is expected that implementations are live... return value streams for all
queries.

### assert (insert or update)

Assert is a way of interpreting things that are recognizable as statement of
facts.

In the context of a knowledge store, to assert a fact means to add it (as a
truth) to the knowledge store.

In general, a knowledge store should generally interpret the `assert` protocol
by adding facts to the store.

A world may be in some ways an interpretation of a graph (though we cannot in
general say that a world is _only_ an interpretation of a graph). A live
interpretation may interpret the `assert` protocol by rearranging the world to
make the assertion true.

### reify (make / construct / ensure / insert or update)

Reification is a way of interpreting a description by making it exist.

`reify` has no abstract implementation; it must be implemented for concrete
types.

For subject-oriented matches, a `reify` protocol may be available for some
definable scope of descriptions. Applying the `reify` protocol to a subject in a
world (context) causes it to be true in that world that the identified thing
meets that description. I say it in this tortured way because there's no
guarantee that `reify` has any effect, and `reify` should indeed make an effort
to do as little as possible.

> Re: value spaces. The description is then deleted? Or does this depend on
> something outside. i.e. is this outside the scope of the rule as such

For at-large matches, it is not clear that a `reify` protocol would apply.

In either case, there are values available from the match resolution, which can
be used by the then binding.

knowledge-based approach can also be used to support an assertional approach to
state manipulation.

Such expressions could be paired with protocols for either assessing or
enforcing rules. The latter kind could be used to drive a monotonic
assertion-based system.

### negate (make untrue)

By extension, a protocol that supports negative assertions could be used to
drive a non-monotonic system.

## everything is live

Assume that anything in the world is or might be live.

You're not asking for a query, you're hooking something up.

And why is this?

Because to assume synchronous would be to overspecify.

## GWT and knowledge-based systems

In a knowledge-based system, you can ask questions and get answers.

## the hypothesis

In short, the hypothesis is that GWT can be a high-level unit of software
composition.

The goal of MELD is to support tools and environments for dynamic userland
modeling, where all “things” (that can be spoken of) are are visible, portable,
etc. The big difference between these “things” and anything in human history, is
that their “behavior” is based on... it's not easy to say, actually. They are
interaction machines, which are a generalization of Turing machines to include
arbitrary, interrupting, non-deterministic (i.e. human) input. They're neither
completely predictable nor completely unpredictable. They are as completely
formal as any tangible thing.

Regardless of the computational model, there is reason to believe that GWT
approximates a minimal formulation of behavior that meets a general portability
requirement. If a thing is portable, then it can retain something of its nature
in unforeseen contexts. For that to be true, the thing must state the minimum
expectations it has about the context in which it will be assessed, before
anything else can be determined.

There is nothing inescapable about the _exact_ manner of communicating these
requirements. For interop to be possible, the system must have already made
assumptions about the “top level” of assessment, _viz_, that it's looking for a
“given” (partial context description) in the first place. Otherwise, this
initial stage of assessment could be seen as both formally indistinguishable
from the “when” condition that it unlocks and any containing “given” condition
that may have unlocked it.

The need for general interoperability has already shown the importance of
globally-unique identifiers wherever the meaning of terms can be previously
agreed upon.

## the experiment

So how can we conduct an experiment to test the usefulness of GWT for creating
portable, composable systems?

Rules themselves are “just data,” though I'm taking that now to include runtime
objects that aren't directly usable in RDF.

### thoughts on complexity and dataflow

The use of tuple spaces / pattern matching is partly brought about to have a
faster (upper bounded) technique for matching predicates against “live” objects,
i.e. streams.

It seems to me of secondary importance whether the evaluation of all stages
proceed at the same rate. Some variance could be accounted for in the
constuction of the dataflow. Where “pressure relief” is needed, you should be
able to reduce the frame rate of some of these steps.

If you're synchronozing (doing truth maintenance), some (if not most) kinds of
message can't be dropped. So how do you drop the frame rate, without breaking
the “eventual” consistency of the UPDATED OBJECT? If it is possible to batch
apply messages, then you can aggregate messages before a stage of processing,
and apply to the aggregate.

> I don't suspect this is an issue in practice. But the replacement algorithm is
> needed rn because the query-based approach for some rule sets was too slow to
> cope with.

## interop

### and RDF / RIF

RIF doesn't have ‘G’ AFAIK.

### and AMD define

You can think of the “given” conditions as expressing requirements.

You could hang a MELD instance on define.... use it as a way to register
things...
