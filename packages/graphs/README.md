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

## Decision log

### Support graph interfaces with non-primitive ID's?

Networkx allows “any hashable object.”  But JavaScript doesn't have hashing
built in.  Thus i'm still in favor of restricting ID's to number and string.

### Support primitive data values for nodes and edges?

Networkx uses dictionaries for “attributes” on all nodes and edges.

Current impl is still open to primitives/undefined as node/edge values.
