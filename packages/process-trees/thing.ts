// Container (or possibly mixin) for things
import { iterator, filter, map, comp, concat } from "@thi.ng/transducers";
import { equivObject } from "@thi.ng/equiv";

interface FunctionRef {}
interface ThingDescription {
  origin: { type: "constructor" | "prototype"; value: FunctionRef };
  // children spec
  // this is really going to be a *function* that returns the child descriptions, right?
}

type ThingUpdateInstruction =
  | { operation: "delete"; key: string }
  | { operation: "add" | "update"; key: string; description: ThingDescription };

interface ThingChildrenSpec {
  [key: string]: ThingDescription;
}

const { keys, entries } = Object;

const same_thing = (a: ThingDescription, b: ThingDescription): boolean => {
  return a && b && equivObject(a, b);
};

// more declarative version but harder to type
const diff_children1 = (
  d1: ThingChildrenSpec,
  d2: ThingChildrenSpec
): Iterable<ThingUpdateInstruction> =>
  concat(
    iterator(
      comp(
        filter(key => !(key in d2)),
        map(key => ({ operation: "delete", key } as ThingUpdateInstruction))
      ),
      keys(d1)
    ),
    map(
      ([key, description]) =>
        //key in d2 ? {operation:"add", key, description} : {operation: "update", key, description}
        ({
          // But you should skip the update if the values are equivalent
          operation: key in d2 ? "add" : "update",
          key,
          description,
        } as const),
      entries(d2)
    )
  );

// imperative but easier typing
function* diff_children(
  d1: ThingChildrenSpec,
  d2: ThingChildrenSpec
): IterableIterator<ThingUpdateInstruction> {
  for (const key of keys(d1))
    if (!(key in d2)) yield { operation: "delete", key };

  for (const [key, description] of entries(d2))
    if (key in d1) {
      if (!same_thing(d1[key], description))
        yield { operation: "update", key, description };
    } else yield { operation: "add", key, description };
}

export class Thing {}
