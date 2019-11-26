// alt, transducer-based version of thing diffing
import { iterator, filter, map, comp, concat } from "@thi.ng/transducers";
import { ThingChildrenSpec, ThingUpdateInstruction } from "./thing-api";
const { keys, entries } = Object;

// more declarative version but harder to type
export const diff_children1 = (
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
