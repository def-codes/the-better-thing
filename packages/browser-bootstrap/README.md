# Browser bootstrap

**NOTE**: This is an old module imported here to support the playgrounds
plugin.  I'll probably kill it tomorrow.  It's superseded by the experimental
amd-loader, portability, and literate experiments.

This module MUST NOT have any dependencies.

This module contains functions for use in the browser before a module loader
(assumed to be RequireJS) is available.

Currently, this is made to support “hot loading” of AMD modules.  At some point
it may be extended to include support for other preambulation, such as
conditional loading of shims.
