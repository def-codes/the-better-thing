// alt, transducer-based version of thing diffing
import { iterator, filter, map, keep, comp, concat } from "@thi.ng/transducers";
import {
  ChildrenSpec,
  ThingUpdateInstruction,
  ThingDescription,
} from "./thing-api";
import { same_thing } from "./thing";
const { keys, entries } = Object;

// more declarative version but harder to type
export const diff_children1 = (
  d1: ChildrenSpec,
  d2: ChildrenSpec
): Iterable<ThingUpdateInstruction> =>
  concat(
    iterator(
      comp(
        filter(key => !(key in d2)),
        map(key => ({ operation: "delete", key } as ThingUpdateInstruction))
      ),
      keys(d1)
    ),
    iterator<[string, ThingDescription], ThingUpdateInstruction>(
      comp(
        map(([key, description]) =>
          key in d2
            ? same_thing(d1[key], description)
              ? undefined
              : { operation: "update", key, description }
            : { operation: "add", key, description }
        ),
        keep()
      ),
      entries(d2)
    )
  );
