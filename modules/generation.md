# Shape-constrained random value generation

Let's generate some random values.

But not just any random values. We want values in certain shapes.

The question is, what does it take to generate random values that conform to a
given spec? Clearly we have to know something about the spec language, and about
random value generation.

We will see that this problem is not solvable in general, and where it is
solvable, it requires a degree of domain knowledge that is not required for all
spec-based protocols.

We have defined a basic spec language (constraints.js) for describing value
spaces.

We can build a validator for this language that tells whether values conform
(TBD). Such a validator can scale linearly with the size of the constraint
language (as currently defined). That is, each term can be implemented more or
less in isolation. Domain-specific validators could provide marginal
optimizations at best [citation needed].

The same is not true for the `generate` protocol. This is related to the P-NP
problem: you can use a predicate to _test_ a solution in a bounded time but you
have no general way to _produce_ a value that satisfies an arbitrary predicate,
other than to try a bunch of values against the predicate.

As with P-NP problems, we can do better in some cases, if we know something
about the condition to be satisfied. For many kinds of predicates, a human can
write a function to generate conformant values.

Composition of constraints creates further special complexity. Composition can
also introduce contradictions. (Individual predicates can also introduce
contradictions, but this, too depends on specific knowledge of the predicates
and thei parameters; whereas contradictions can be expressed and detected in
general for logical compositions, such as A AND NOT A).

## Prior art

There is a lot of prior art on this. See generative testing. (Though this is
just about the generation part.)

## Future work

### Target distributions

We can also ask for a random sequence that follow a certain random distribution.
For example, we might want a sequence of 1's and 0's that is 0 twice as often as
it is 1. We could build the requisite (stateful) generator on top of the simpler
mechanism by forwarding only values that would follow the desired distribution.
Intuitively, this falls into a similar problem as described above, where we are
“waiting” for certain values from the generator.

In this case, there may be a way to get a good result for the general case by
creating multiple generators and selecting them according to the described
distribution.

## Domain-specific stuff

### Complications arising with numbers

max safe integer

bigint
