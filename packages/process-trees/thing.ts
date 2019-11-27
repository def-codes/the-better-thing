// Container (or possibly mixin) for things
import { IDispose } from "./disposable";
import { assert_unreachable } from "@def.codes/helpers";
import {
  ChildrenSpec,
  ThingDescription,
  ThingUpdateInstruction,
} from "./thing-api";
import { equivObject } from "@thi.ng/equiv";

const { keys, entries } = Object;

export const same_thing = (
  a: ThingDescription,
  b: ThingDescription
): boolean => {
  return a && b && equivObject(a, b);
};

// imperative but easier typing (than alt version)
function* diff_child_specs(
  d1: ChildrenSpec,
  d2: ChildrenSpec
): IterableIterator<ThingUpdateInstruction> {
  for (const key of keys(d1))
    if (!(key in d2)) yield { operation: "delete", key };

  for (const [key, description] of entries(d2))
    if (key in d1) {
      if (!same_thing(d1[key], description))
        yield { operation: "update", key, description };
    } else yield { operation: "add", key, description };
}

function apply_instruction(
  thing: Thing,
  instruction: ThingUpdateInstruction
): void {
  const { key } = instruction;
  switch (instruction.operation) {
    case "delete":
      thing.remove_child(key);
      break;
    case "add":
      thing.add_child(key, instruction.description);
      break;
    case "update":
      thing.update_child(key, instruction.description);
      break;
    default:
      assert_unreachable(instruction, "instruction");
  }
}

const apply_description = (
  thing: Thing,
  spec1: ChildrenSpec,
  spec2: ChildrenSpec
): boolean => {
  const diffs = [...diff_child_specs(spec1, spec2)];
  for (const instruction of diffs) apply_instruction(thing, instruction);
  return diffs.length > 0;
};

const reify = (description: ThingDescription): Thing => {
  const { ctor, args } = description.extends;
  return ctor(...args);
};

export class Thing<T = unknown> implements IDispose {
  /* protected */ children: Map<string, Thing> = new Map();

  constructor(readonly map: (args: T) => ChildrenSpec) {}

  set_parameters(args: T) {
    const spec = this.map(args);
    const changed = apply_description(this, {}, spec);
    if (changed) console.log("CH CH CH CH CHANGES!");
  }

  add_child(key: string, description: ThingDescription) {
    const spawned = reify(description);
    this.children.set(key, spawned);
  }

  update_child(key: string, description: ThingDescription) {
    // naive: remove then spawn
    this.remove_child(key);
    this.add_child(key, description);
  }

  remove_child(key: string) {
    this.children.get(key)?.die();
    this.children.delete(key);
  }

  die(): void {
    for (const child of this.children.values()) child.die();
  }

  dispose() {
    this.die();
  }
}
