import * as tx from "@thi.ng/transducers";
import { register_driver } from "../system";

register_driver("transducerDriver", ({ q }) => ({
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
          get: () => tx.partition(size.value)
        }
      })
    },
    {
      when: q("?subject partitionsWith ?spec"),
      then: ({ subject, spec }) => ({
        register: {
          subject,
          as_type: "Transducer",
          get: () => tx.partition(spec.value.size, spec.value.step)
        }
      })
    }
  ]
}));
