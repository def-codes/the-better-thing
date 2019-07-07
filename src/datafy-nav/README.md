# Datafy/nav

QUESTION:
  What does datafy return as the value of a key when that key is an object,
  something that you don't want to traverse into.  The whole point is about not
  leaking object references.  Something you need to nav into.


This package provides two functions: `datafy` and `nav`, based on the ideas
behind [the (alpha) `datafy` package introduced in Clojure
1.10](https://clojure.github.io/clojure/branch-master/clojure.datafy-api.html).

The main ideas (as I see them) are:
- single protocol for inspection and traversal of (potentially remote) runtime
  objects
  - without direct runtime references
- encourage linked-data paradigm
- bottom out on data, supports visibility
- remotable
- general and dynamic: can be used as an incremental computation protocol

datafy/nav:
- standalone protocols
  - independent from processes
  - independent from rdf
  - independent from subsystems, composition, etc
- provides a way to traverse anything
  - in a way that resembles object graphs
  - but without needlessly leaking object references
- applications / things we know would be datafiable/navigable
  - plain data
  - the system
  - dom elements
  - generally any resources from built-in api's (web audio, etc)
  - processes (including across workers and even remote over sockets)
  - the triple store (the canonical linked data)
  - subscriptions and streams
  - channels
  - subscription/channel sync and merge nodes?
  - pipelines between channels? (they are not even a runtime thing as such)
    - yet they are like a process
  - fsm
  - interceptor bus
