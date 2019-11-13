export * from "./force-simulation";
export * from "./http-server";
export * from "./file-system-watcher";
export * from "./triple-store";
export * from "./web-socket-client";
export * from "./web-socket-server";

/*
Could a dataflow be such a thing?  IPC is separate, yet dataflow needs to be managed.
Dataflow is asserted at each node.

- host types?
  - worker?
  - vm?
  - child process?
- shell process? (could be host type or one-time)
- one-time / promise
  - http request?
- fsm (maybe a transform?)
- interceptor bus (maybe a stream transform??)
- parser (built on FSM)
- message ingress
  - event has to be initialized on a hard reference.  how to provide this as data?
    - can get it during dataflow?  also defeats the purpose, right?
    - really need to avoid putting things into dataflow
    - but ultimately you can't stop it
  - general or special?  (EventTarget, EventEmitter)
  - e.g., event streams (always contingent on a runtime thing)
    - dom events (specific element)
    - storage event (global)
    - navigation event (global)
    - postmessage event
- timer? (just a message ingress?)
- knowledge base (yes, the knowledge base itself) (see triple store)
- space (container of things)
- dataflow things (may be special case for ipc)
  - subscription
  - stream merge (")
  - stream sync (")
  - meta stream
- multi-meta stream (this is the new mysterious thing...)
- hdom
- message egress

*/
