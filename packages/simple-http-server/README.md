# Simple HTTP server

A minimal, extensible, location-agnostic HTTP server for local usage.

It's “location agnostic” in that handlers see only the path, which is not
necessarily the same as the original request path. Handlers should not set the
`Content-length` header; it is set automatically.

Notable features that are not present:

- conditional GET using timestamp
- conditional GET using hash
- gzip suppport (for pre-zipped files having `.gz` extension)
- declaration of content encoding for text resources
- an “SPA mode” that serves root index in lieu of 404's?

This package currently has no external dependencies (apart from Node built-ins).
