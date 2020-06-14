import * as tx from "@thi.ng/transducers";

export default {
  name: "transducerDriver",
  init: ({ q }) => ({
    claims: q(
      "Transducer isa Class",
      "MappingTransducer subclassOf Transducer",
      "FilteringTransducer subclassOf Transducer",
      "PartitioningTransducer subclassOf Transducer",
      "PluckingTransducer subclassOf Transducer",
      "mapsWith domain MappingTransducer",
      "mapsWith range Function",
      "filtersWith domain FilteringTransducer",
      "filtersWith range Function",
      "partitionsBy domain FilteringTransducer",
      "partitionsBy range integer",
      "plucks domain PluckingTransducer",
      "plucks range Literal" // s/b key (currently string/number)
    ),
    rules: [
      {
        when: q("?subject mapsWith ?fn"),
        then: ({ subject, fn }) => ({
          register: {
            subject,
            as_type: "Transducer",
            using: () => tx.map(fn.valueOf()),
          },
        }),
      },
      // TRANSITIONAL
      {
        when: q("?subject mapsValuesWithResource ?node", "?node value ?fn"),
        then: ({ subject, fn }) => {
          const fun = fn.valueOf();
          return {
            register: {
              subject,
              as_type: "Transducer",
              using: () => tx.map((values: any[]) => values.map(fun)),
            },
          };
        },
      },
      {
        when: q("?subject filtersWith ?fn"),
        then: ({ subject, fn }) => ({
          register: {
            subject,
            as_type: "Transducer",
            using: () => tx.filter(fn.valueOf()),
          },
        }),
      },
      {
        when: q("?subject partitionsBy ?size"),
        then: ({ subject, size }) => ({
          register: {
            subject,
            as_type: "Transducer",
            using: () => tx.partition(size.valueOf()),
          },
        }),
      },
      {
        when: q("?subject partitionsWith ?spec"),
        then: ({ subject, spec }) => ({
          register: {
            subject,
            as_type: "Transducer",
            using: () =>
              tx.partition(
                spec.valueOf().size.literal,
                spec.valueOf().step.literal
              ),
          },
        }),
      },
      {
        comment: `A special case of map that returns the specified key from the input.  Nullish *input* values will forward themselves.`,
        when: q("?subject plucks ?key"),
        then: ({ subject, key }) => ({
          register: {
            subject,
            as_type: "Transducer",
            using: () => {
              const k = key.valueOf();
              return tx.map(value => value?.[k]);
            },
          },
        }),
      },
    ],
  }),
};
