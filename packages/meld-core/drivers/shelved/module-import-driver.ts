import rdf from "@def.codes/rdf-data-model";

export default {
  name: "moduleImportDriver",
  init: ({ q }) => ({
    claims: q(
      // I'm not sure what this would be for.
      //
      // Currently, ES modules cannot be effectively distinguished (from
      // scripts) by MIME type.  https://github.com/whatwg/html/pull/443
      // "ECMAScriptModule isa Class",
      // This is completely ad hoc and meant  as temporary
      "moduleAt isa Property"
    ),
    rules: [
      {
        when: q("?subject moduleAt ?uri"),
        then: ({ subject, uri }) => ({
          assert: [
            [
              subject,
              rdf.namedNode("hasSource"),
              // @ts-ignore: Yes, I know I know.  See http-dereference-driver for more
              rdf.literal(sub => {
                const address = uri.valueOf();
                // RequireJS works when `import` doesn't.  Because the target is
                // not actually a module, I presume?
                window["requirejs"](
                  [address],
                  result => sub.next(result),
                  error => sub.error(error)
                );
                // import(address).then(
                //   response => {
                //     sub.next(response);
                //   },
                //   error => sub.error(error)
                // );
              }),
            ],
          ],
        }),
      },
    ],
  }),
};
