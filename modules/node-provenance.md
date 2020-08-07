# Node provenance

Following are some notes on constructing a dataflow for spaces and force
simulations.

A space may have at most one associated force simulation.

(Or, if it has more than one, this one is distinguished.)

Things in a space can participate (as bodies) in that force simulation.

> (Maybe should by default, and it should be opt-out, but that's another
> question).

In terms of JavaScript objects, we have some mixture going on.

Who owns what? This must be clear because it's critical to our understanding of
the (process) model, as well as for reference management. Whether for the rest
of the world's purposes a map (subject by key) may not be more suitable should
not interfere our efficiently interfacing with the simulation object
(internally).

`d3.forceSimulation` expects nodes to be provided as an array of objects. That
is an invariant. Moreover, `d3.forceSimulation` “owns” those objects, at least
partly. Each step of the simulation may mutate the `x`, `y`, `vx`, and `vy`
properties of the objects in the array. Initializing the simulation may also
write those properties, besides doing a (one-time?) set of the `index` property,
which is the object's position in the array.

TFM: https://github.com/d3/d3-force#simulation_nodes

In general, we want the simulation process to be long-running, even through
continuous changes in the force definitions and the nodes' appearance and
connection to each other. Indeed, the forcefield partakes only in the node's
_positioning_, and then only for the elements that participate.

What about the set of nodes, though? What is d3 doing to diff? If we remove a
node, do we have to reindex the successors? How does it handle a sparse array?
Do id properties matter at all?

How do we handle changes?

The things that are participating in these simulations are essentially
processes. They are processes whose representation is based on assertions.

The goal is to support the expression of sensible, targeted assertions in some
system that let us say what we mean about these things, along with an
imlementation that is as efficient as the underlying interface, avoids reference
leakage, and supports knowledge-based protocols.

- when a node is added, what do we expect?

- when a node is removed, what do we expect?

What do "added" and "removed" mean?

_All_ that we want to do with the result of the simulation is say:

- for each node in the simulation, the `--x` and `--y` (and `--vx` and `--vy`,
  for fun) values set as custom properties in a rule targeting elements
  representingthat thing in the space (or things that want to partake in the
  value indirectly, via the `data-{v}-source` attributes).

This is considered an effectful sink.

CSS assertions can be reified in more than one way, with a tradeoff between
performance and persistence. If targeting only the effect,

Writing CSS style text outright to the dom may be preferable, as this should
automatically be persisted with the document (or fragment).

When DOM assertions are written, a single assertion should be used (to set all
at once as the CSS text of a persistent `style` element).

Part of the solution here is to create an object for each node that has the
thing as its prototype.

Other node properties that `d3.forceSimulation` takes an interest in:

- `fx`, `fy`: when present, these properties override

In this case, we don't want `fx` and `fy` to be on the object that we give to
d3. This is because “we” control whether and how the object is fixed. We set
these properties individually on the nodes, and changes should be effective
immediately in the force simulation.

The node object that we have, we want to say as little as possible about. It may
have all kinds of properties, affordances, and magic, a lifetime of its own. The
main thing is that we can define forces using everything we know about, and in
such a way that those force definitions can themselves be streams.
