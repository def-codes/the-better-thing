# Runtime reflection

This package provides a registry mechanism to support runtime reflection with
the aim of supporting MELD's objectives: discoverability, visibility, etc.

## Motivation

We need a knowledge base of the things in our program while it's running.  Seems
to me the burden of proof should be on *not* having this, but anyway.

A *runtime knowledge base* is a repository of knowable things in a running
program.  It cross references between actual runtime objects and descriptions of
those objects.

Keeping such a knowledge base synchronized with reality requires two kinds of
process: reification and reflection.  *Reification* is the process of turning
descriptions of things into reality.  *Reflection* is the process of turning
reality into descriptions.  This package is concerned with supporting the
latter.

## Design

The runtime registry supports a data-based interface to runtime objects.

Why is this important?  Because it makes things remotable, for one.
Descriptions of things can be transferred over the wire to another system as
information for processing.

The registry relies on protocols to do most actual work.


## Questions

### In what cases do you really need reflection (versus reification)



### How does the registry learn about new things?

That's not the registry's problem as such.

Yet... I'm not sure it can be useful without this.

### How do things interact with the registry?

Do they access it directly, or is this done primarily by types.

If protocol implementations use the registry, how do they get access to it?

### Is the registry a singleton?  If so, where does it live?

It has to be accessible through the global namespace.

### How does the registry support discovery?

This is a good question.  It bears on the design.  If the registry needs to
support discovery, then there are additional space requirements, since it would
need to enumerate the contents of the registry.

Either the registry itself could provide an enumerable set of keys or it could
let this be the job of another mechanism, in which case it would need to provide
notifications of changes (which it would do anyway).

### What events should be published by the registry?

- add to registry

That's it?  Is there a reason/occasion to support explicit removal from the
registry?
