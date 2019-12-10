# Graphs

This package is about graphs and traversals
- a flexible protocol for communicating facts about graphs
- “graph reducers”: special reducers (and configs) that produce graphs from such
- support for representation of graphs
- notions 
- adapters between concretions implementing sparse interfaces
  - semantics for describing available methods
    - time-space complexity
    - support extension with adapters between protocols
  - keep interface and data structure separate
  - support adaptation with various implementations
- facilities for lifting in-memory object graphs into portable representations
- PROVISIONAL: coroutine specs for dynamic traversals (searches)

## Concepts

### Fact (traversal item)

### Graph

### Root nodes and start nodes

A *start node* is an entrypoint given to a traversal.

A *root node* is a node in a directed graph that has no inbound links.

Nodes encountered during a traversal will by definition not be root nodes,
assuming that movement occurs along edges.

A start node is not necessarily a root node, since the traversal may encounter
an edge pointing to it.

In an acyclic graph, a start node will also be a root node.





## Decision log

### Support graph interfaces with non-primitive ID's?

Networkx allows “any hashable object.”  But JavaScript doesn't have hashing
built in.  Thus i'm still in favor of restricting ID's to number and string.

### Support both strings and numbers as ID's in the same graphs?

This is just for TypeScript, not considering dynamic restrictions

the distinction is out-of-band in most contexts
i.e. you can't tell 1 from "1" by looking at the stringified output
js also collapses these when used as object keys
- that should be incidental
  - but in practice would affect serialization of constructed graphs when
    object is reduction target
could support one *or* the other across a graph
if I had to pick one it would be number, but string would be convenient


### Support primitive data values for nodes and edges?

Networkx uses dictionaries for “attributes” on all nodes and edges.

Current impl is still open to primitives/undefined as node/edge values.

