# Runtime reification

Reify the idea of a runtime environment.  Serves as basis for something like
REPL but also other interfaces.  Suitable for remoting.

## Namespaces and tracking

We can't in general make any given runtime environment a “live namespace.”

But we have options in different environments for approximating it.
- in node:
  - vm with Proxy as context
- in browser
  - iframe (with polling? ick)
 
And we *can* make a live namespace *within* the global one, which is generally
what we'll want to do anyway.
