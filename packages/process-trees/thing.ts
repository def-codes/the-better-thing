// Container (or possibly mixin) for things
import {
  ThingChildrenSpec,
  ThingDescription,
  ThingUpdateInstruction,
} from "./thing-api";
import { equivObject } from "@thi.ng/equiv";
import { assert_unreachable } from "@def.codes/graphviz-format/assert_unreachable";

const { keys, entries } = Object;

const same_thing = (a: ThingDescription, b: ThingDescription): boolean => {
  return a && b && equivObject(a, b);
};

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

function apply_instruction(instruction: ThingUpdateInstruction, thing: Thing) {
  const { key } = instruction;
  if (instruction.operation === "delete") thing.remove_child(instruction.key);
  else if (instruction.operation === "add")
    thing.add_child(key, instruction.description);
  else if (instruction.operation === "update")
    thing.update_child(key, instruction.description);
  else assert_unreachable(instruction.operation, "operation");
}

function apply_description(
  d1: ThingChildrenSpec,
  d2: ThingChildrenSpec,
  instance: Thing
) {
  for (const instruction of diff_children(d1, d2))
    apply_instruction(instruction, instance);
}

export class Thing {
  add_child(key: string, description: ThingDescription) {}
  update_child(key: string, description: ThingDescription) {}
  remove_child(key: string) {}
}
