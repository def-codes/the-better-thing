const tx = require("@thi.ng/transducers");

const triples_to_facts = triples =>
  tx.flatten(
    tx.map(
      ([subject, predicate, object]) => [
        { subject, value: subject.value },
        { subject: object, value: object.value },
        { subject, object, data: predicate },
      ],
      triples
    )
  );

module.exports = { triples_to_facts };
