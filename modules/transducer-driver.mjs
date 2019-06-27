import { register_driver } from "./system.mjs";

// Hack for browser/node support
import * as rs1 from "../node_modules/@thi.ng/rstream/lib/index.umd.js";
import * as tx1 from "../node_modules/@thi.ng/transducers/lib/index.umd.js";
const rs = Object.keys(rs1).length ? rs1 : thi.ng.rstream;
const tx = Object.keys(tx1).length ? tx1 : thi.ng.transducers;

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
