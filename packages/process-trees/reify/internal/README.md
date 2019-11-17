# Reify internals

The modules in this directory are for internal use only and should not be
exported.

This arrangement is used because the reify implementations are not meant to be
invoked directly by clients; rather, they are accessed indirectly through the
`reify` function, which wraps the underlying protocol in some common processing.
