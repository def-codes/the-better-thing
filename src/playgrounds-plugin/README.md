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


## Regarding `forceConsistentCasingInFileNames`

The `server/tsconfig.json` specifies:

```json
    "forceConsistentCasingInFileNames": false,
```

To override the default in the base config.  Without this, I get errors like:

```
packages/playgrounds-plugin/server/reflection/reflect.ts:2:22 - error TS1149: File name '/Users/GCannizzaro/mindgrub/mindgrub/packages/graphviz/index.ts' differs from already included file name '/Users/GCannizzaro/mindgrub/mindgrub/dist/graphviz/modules/index.d.ts' only in casing.

2 import * as dot from "mindgrub-graphviz";
                       ~~~~~~~~~~~~~~~~~~~

packages/playgrounds-plugin/server/reflection/reflection_server.ts:19:8 - error TS1149: File name '/Users/GCannizzaro/mindgrub/mindgrub/packages/core/index.ts' differs from already included file name '/Users/GCannizzaro/mindgrub/mindgrub/dist/core/umd/index.d.ts' only in casing.

19 } from "mindgrub";
          ~~~~~~~~~~
```

These look suspicious, and may be due to an issue with that setting on certain
systems:

- [Error with forceConsistentCasingInFileNames when using extended config files
  on case insensitive systems
  #20003](https://github.com/Microsoft/TypeScript/issues/20003)

- [Unexpected error from forceConsistentCasingInFileNames when using `extends`
  in tsconfig #16875](https://github.com/Microsoft/TypeScript/issues/16875)

However, I tried inlining the config and got the same result.
