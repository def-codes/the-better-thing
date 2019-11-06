// Cast web socket client and server in terms of common process interfaces

export interface WebSocketServerWrapper {
  // socket server is a process that
  // - has fixed properties (address)
  // - has variable state (clients (i.e. the contingent))
  // - is a state machine (created -> listening -> closed)
  // - has common process-related events (die, error?)
  // - has common subsystem related events (change to immediate children)
  //   - but this is now about contingent only?
  // - has events related to itself (headers, listening?)
  // - has a set of contingent processes
  // - has an INGRESS announcing client connections
}

export interface WebSocketWrapper {
  // socket is a process that
  // - has fixed properties (server address)
  // - is a state machine (readyState: connected -> open -> closing -> closed)
  // - has common process-related events (die, error?)
  // - has events related to itself (ping/pong)
  // - is contingent on another process
  // - has an EGRESS as its (main/only?) output port
  // - has an INGRESS as its (main/only?) input port
  // - the associated server MAY be an instance in this system
}
