# CSP

**NOTE**: This is “legacy” code from an old proof-of-concept.  It was brought in
to support the plugin (which was also a proof-of-concept).  It will be replaced
with newer process models as part of the MELD project.

This is a simple, standalone implementation of Communicating Sequential
Processes with *visibility* as a first-class priority.  To that end,

- processes and channels are all discoverable within a system
- owner relationships between processes is discoverable
- all significant activity (process lifecycles and I/O) is traceable (when the
  provided mechanisms are used)
- execution can be run stepwise (notwithstanding push-based event sources)
