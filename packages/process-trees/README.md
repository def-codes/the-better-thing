# Process trees, take N

## Motivation

Declarative approach to dataflow.

Support a kind of component model involving dataflow.

But this is really about assertion of facts based on data in a dataflow.

Whereas the structure of that dataflow may be driven by facts, the dataflow may
only vary with the fact network.  In other words, it's one thing to create rules
in which facts drive changes to the dataflow.  In this case, changes can occur
when either the facts or the rules change.  When the rules are themselves
represented as facts, the result is that only changes to the knowledge base can
cause changes to the dataflow.

Meanwhile, the actual data flowing through the described structure remains
entirely out of scope.  This constrains the degree of dynamism in the dataflow,
since values (rather than facts) will be the locus of much activity in the state
of the system.

On approach to this would be to support a kind of “egress” that feeds values
back into the system as assertions (as would be done through an ingress).  This
approach will not work in a monotonic system if the requirement is that facts
formerly (but no longer) asserted should be “unasserted” (notwithstanding that
they may still be asserted by other parties).  Again, this is basically
incompatible with a monotonic system.  How can you separate this concern from
that of the requirement---that a certain set of facts should be
non-monotonically asserted based on the *state* of a given entity in the system?

A distinction here is that the knowledge base only “acknowledges” the existence
of the claims in its store.  While some of those claims talk about perdurant
processes that may be (indeed are) running in the current system, such claims
are independent of the state of those running instances.  The claims describe
the processes, but not their state.  That is, they describe the processes in
terms of how they are constructed and how they are connected.  Additional facts
may refer to the runtime instances themselves, for the sake of associating
reified/unreflected instances with the claims describing them.

If claims are to take as their provenance the state of the objects, a new domain
must be introduced.  Furthermore, the state of these instances is non-monotonic,
while the descriptions are (or may be) monotonic.  So you have (in theory) a
domain involving non-monotonic claims about things that are (at least relative
to the state) monotonic.  Such claims *can* cohabitate in a single knowledge
graph.  But this seems problematic.  Why?

First, how would the "unassertion" take place?  Facts meant to be treated in
this way would need to be scoped (even in a non-monotonic system) so that their
“removal” is not effected by a general unassertion, lest this contract
assertions still in effect by other means.

That is, in order for *any* source of facts to be treated as dynamic, a
dedicated scope must be introduced.  In this way, the enclosing graph must
itself become derivative, being the union of said scope, along with other any
sources contributing facts.

Note that such a scheme would yield a monotonic graph as long as the constituent
graphs were themselves monotonic.

Note that this scheme can also be applied recursively; a scope that contributes
to another graph may itself be the composite of contributing scopes.

Indeed, depending on how the inclusion is asserted, there is nothing to prevent
cycles in the system's composition.  

In RDF 1.1 terms, such a scheme could be accomplished using claims about named
graphs.

The problem becomes partly a matter of dealing with rules that no longer match,
which can call for the destruction of things.  It may be possible to isolate the
effect of this problem primarily to drivers, which would have to support these
“negative deltas.”

The other part of the problem, though, is how to create the “scopes” in
question.  What are the goals, the invariants, the rules, etc.  Can (and should)
such a thing be implemented in the absence of a triple store---let alone a quad
store?

And back to the issue of process trees.  And as transducers or not.  This is a
special case of the above problem, where you have a special mechanism to deal
specifically with diffing, assertion, reification, etc for a specific kind of
thing.

In a specific scope.

i.e. doesn't the requirement (as noted above) of a special scope for systems
like this imply that parts of it *could* be done independently of a complete
knowledge base?




## Prior art

“A Meta Representation for Reactive Dependency Graphs”
Master-Thesis von Nico Ritschel

https://www.cs.ubc.ca/~ritschel/files/masterthesis.pdf

Talks about static and operational models for reactive dataflows that support
reification and “unreification” (what I might call “reflection”).  In
particular, details a notion of *updating* a dataflow from descriptions based in
host data structures.

I can't seem to find where I came across this paper.

-
  https://www.semanticscholar.org/paper/A-Meta-Representation-for-Reactive-Dependency-Ritschel/1d86338c4cb0d6c2fdcd134efeec738c9bc7443a


## As transducers
