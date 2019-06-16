(function() {
  const NAME = "transducerDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  const { rstream: rs, transducers: tx } = thi.ng;

  meld.register_driver(NAME, ({ q }) => ({
    claims: q(
      "Transducer isa Class",
      "MappingTransducer subclassOf Transducer",
      "FilteringTransducer subclassOf Transducer",
      "PartitioningTransducer subclassOf Transducer",
      "mapsWith domain MappingTransducer",
      "mapsWith range Function",
      "filtersWith domain FilteringTransducer",
      "filtersWith range Function",
      "partitionsBy domain FilteringTransducer",
      "partitionsBy range integer"
    ),
    rules: [
      {
        when: q("?subject mapsWith ?fn"),
        then: ({ subject, fn }) => ({
          register: {
            subject,
            as_type: "Transducer",
            get: () => tx.map(fn.value)
          }
        })
      },
      {
        when: q("?subject filtersWith ?fn"),
        then: ({ subject, fn }) => ({
          register: {
            subject,
            as_type: "Transducer",
            get: () => tx.filter(fn.value)
          }
        })
      },
      {
        when: q("?subject partitionsBy ?size"),
        then: ({ subject, size }) => ({
          register: {
            subject,
            as_type: "Transducer",
            get: () => tx.partitionBy(size.value)
          }
        })
      }
    ]
  }));
})();
