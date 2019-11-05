# Using process trees to describe socket server and clients

How do you want a socket server to work?

What would be the easiest way to *say*, spawn a socket server, and a bunch of
clients?

Or, spawn a browser that talks to it?  What is the simplest way you could say
that?  That didn't gloss over anything essential about the domain?

You don't specify a port?  Okay, find a port... but that is non-deterministic.

Client loses connection?  Ping periodically to try again.

What would this look like in RDF?

## Definitions

A socket server is a stateful mechanism that provides message-based
communication with clients over a system-provided network.

The constructor arguments are
- host
- port
- secure?

The events are
- opened?
- client has connected
- client has disconnected
- client has sent a message

The messages/capabilities are
- send a message to a specific client
- shut down

Socket clients are created by the mechanism itself.

The creation of a socket client is triggered by an outside event.

Socket clients are like child processes of the server in that
- their provenance/parent is the server
- they cannot practically outlive the parent

NO!!!!

Socket clients are not like child processes.  They have no independent
existence.  They are only identifiers on messages that all target the server.

If anything, socket clients are like *ports*.

The ports that exist on this thing come and go.  The way that it happens is not
exposed to you and is in any case not explicable.

The mechanism lets you hook the events... no?

Another difference with process tree spec is that process tree is about
*asserting* the existence of a process with a certain description, so that the
system can create it (or update it when possible).  Whereas with the socket
server, it creates the “child” thing, and by the time you find out about it, it
already exists.  You still want to wrap it, though.

## Questions

How could this be constructed in such a way that a more detailed, inspectable
subsystem could be available without changing the (minimum usable) interface?


## GOAL: expose WebSocket through one or more general process interfaces

The goal of the interfaces is to support interop etc.

abstraction around socket server

### Candidates

Abstractions that seem to fit the shape of these things.

#### Client

A web socket *client* is like the following process subtypes (specializations):
- subscribable (thi.ng) :: emits messages
- subscriber (thin.g) :: accepts messages
- state machine (thi.ng) :: has a discrete state with defined transitions
  - separate from (or at least a superset of) those common to processes

#### Server

A web socket *server* is like the following process subtypes (specializations):
- subscribable (thi.ng) :: emits event messages “from itself”
- state machine (thi.ng) :: has a discrete state with defined transitions
- port collection (def.codes) :: has multiple, dynamic, named ports
- process tree spec (def.codes) :: has child processes (clients) tied to lifetime


#### Impl?

not model, but implementation candidate?
- interceptors :: most things are events and messages
- interceptors :: accepts event messages

### Descriptions to support

See socket.ttl

### Can you expose a socket client as a stream?

No.  It's too complex:
- it has a discrete state not exactly the same as general process states
  - it has a CONNECTING (pre-open) state (before you can read or write)
  - it has a CLOSING (pre-closed) state (in which it's presumably unusable)
- it has separate read-write ports
  - they are linked together:
    - semantically, they are “about” the same thing
      - I mean, they are related to the same remote
    - you cannot create one without creating the other
    - you cannot close one without closing the other
  - they are different:
    - readable stream is an ingress/source
    - writable stream is an egress/sink
- it also has additional metadata
  - at least, what is the remote address
- it has special `ping` and `pong` methods and events

### Rules/event handlers/Invariants to maintain


- Given a web socket server
  - When a connection is made with a new client
    - Then we assert the provided socket as a child process of the server
