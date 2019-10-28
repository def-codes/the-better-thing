# Typescript playground plugin

This package contains a (work-in-progress) Typescript plugin and related
functions for supporting as-you-type output from Typescript code from any IDE
with Typescript language server integration.


## Regarding the duplication of certain constants

The fifle `client/discovery.ts` duplicates a few constants that are shared
between the client and server modules.  If I attempt to import directly from
their definition, i.e.

```javascript
import * as reflection from "../server/reflection-constants";
```

I get a build error:

```
$ npm run build:playgrounds:client

> @mindgrub/mindgrub@0.1.23 build:playgrounds:client /Users/GCannizzaro/mindgrub/mindgrub
> tsc --build packages/playgrounds-plugin/client

/Users/GCannizzaro/mindgrub/mindgrub/node_modules/typescript/lib/tsc.js:1261
            throw e;
            ^

Error: Debug Failure.
    at Object.assertDefined (/Users/GCannizzaro/mindgrub/mindgrub/node_modules/typescript/lib/tsc.js:1266:24)
    at /Users/GCannizzaro/mindgrub/mindgrub/node_modules/typescript/lib/tsc.js:11032:84
```

This may be a bug in TypeScript.  The present measure is a workaround, although
I'm not sure that that sort of oblique import would be valid in any case.
