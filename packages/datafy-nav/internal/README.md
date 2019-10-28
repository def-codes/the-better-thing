# Datafy/nav internals

The modules in this directory are for internal use only and should not be
exported.

This arrangement is used because the datafy and nav implementations are not
meant to be invoked directly by clients; rather, they are accessed indirectly
through the `datafy` and `nav` functions, which wrap the underlying protocol in
some common processing.
