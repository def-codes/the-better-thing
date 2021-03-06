/**
 * Bridge between runtime and knowledge base.
 *
 * Subjects in a knowledge base can be “implemented by” runtime objects.
 *
 * The registry can provide access to those objects.
 *
 * Subjects can be blank nodes.
 *
 * The registry asserts into the graph facts about the registered items.
 *
 * PROVISIONAL
 *
 * A registry may be shared by multiple graphs.
 *
 * We assume that any graphs sharing a registry also share a blank node space.
 *
 * An implementation of an object is tied to the graph that registers it.
 */
import { EquivMap } from "@thi.ng/associative";
import rdf from "@def.codes/rdf-data-model";
import type { Term, NamedNode } from "@def.codes/rdf-data-model";
import type {
  PseudoTriple,
  IRDFTripleSink,
} from "@def.codes/rstream-query-rdf";

export interface Registry {
  register(
    sink: IRDFTripleSink,
    subject: Term,
    type_name: string,
    get_object: () => any
  ): void;
  // Note that this dereferences the term referring to the implementation, *not*
  // the term referring to the subject being implemented.
  find(implementation: Term): any | undefined;
}

const mint_blank = () => rdf.blankNode();

const AS = rdf.namedNode("as"); // for runtime only
const IMPLEMENTS = rdf.namedNode("implements"); // s/b meld:

export const make_registry = (): Registry => {
  const _things = new EquivMap<Term | [Term, Term], any>();

  return {
    register(sink, subject, type_name, thunk) {
      const assert = (fact: PseudoTriple) => sink.add(fact);

      const type = rdf.namedNode(type_name);
      if (!_things.has([subject, type])) {
        let object: any;
        try {
          object = thunk();
        } catch (error) {
          // Should also know driver/rule source here.
          console.error(
            `Error getting value for ${subject.value} as type ${type_name}`,
            error
          );
          return;
        }

        const object_id = mint_blank(); // TODO: should use IRI's instead
        _things.set(object_id, object);
        _things.set([subject, type], object);
        assert([object_id, IMPLEMENTS, subject]);
        assert([object_id, AS, type]);
      }
    },
    find: implementation => _things.get(implementation),
  };
};
