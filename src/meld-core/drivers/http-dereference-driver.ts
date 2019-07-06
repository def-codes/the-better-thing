import rdf from "@def.codes/rdf-data-model";

export default {
  name: "httpDereferenceDriver",
  init: ({ q }) => ({
    // Is this vocab concerned with JSON / XML / Text / Blob?
    // We don't even quite know that this is HTTP/S protocol
    // as technically an IRI can use other protocols
    claims: q("dereferences isa Property"),
    rules: [
      {
        // Anyway for the moment we're using literals since terms don't currently
        // use actual IRI's.
        when: q("?subject dereferences ?uri"),
        then: ({ subject, uri }) => ({
          assert: [
            [
              subject,
              rdf.namedNode("hasSource"),
              // @ts-ignore: Yes, I know I know
              rdf.literal(sub => {
                const address = uri.valueOf();
                fetch(address).then(
                  response => {
                    if (response.ok) {
                      const content_type = response.headers.get("content-type");
                      if (content_type.startsWith("application/json"))
                        response.json().then(value => sub.next(value));
                      else if (
                        content_type.startsWith("application/octet-stream")
                      )
                        response.blob().then(value => sub.next(value));
                      else response.text().then(value => sub.next(value));
                    } else sub.error({ status: response.status });
                  },
                  error => sub.error(error)
                );
              })
            ]
          ]
        })
      }
    ]
  })
};
