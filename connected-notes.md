Notes on the notation used in connected.js

A graph and its maximally connected components can be seen in a single notation
by using an encoding channel (such as color) that supports visual grouping of
elements.

The notation takes as an input a set of values from said encoding channel
(e.g. a set of colors).  These can be provided from a default source.

This notation can be decomposed by viewing the mapping from node id's to
assigned label (and thence to encoding), literally as a standalone map.

The notation can be decomposed *temporally* by following the traversal used to
label the nodes, which is a sequence of states.

From here, it may be desirable to treat the output as a set of graphs (though
see ff note).

Note that the implementation used here yields a collection of sets of node id's,
*not* subgraphs.  That is, it doesn't include edges in its result.  Edges would
belong to the component containing any of their associated vertices and thus
subgraphs could be easily constructed.

Closely related to this operation is the notion of connectedness (density of
connections).
