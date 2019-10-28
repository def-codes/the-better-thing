import {
  depth_first_walk,
  object_graph_to_dot,
  walk_object,
} from "./general-object-to-graphviz";
import * as Dot from "@def.codes/graphviz-format";
import { sequence as seq } from "mindgrub";

// @ts-ignore: WIP
const EXAMPLE_OBJECT = {
  name: "insulation",
  a_number: 4,
  when: new Date(),
  things: [
    "mainly",
    "attractions",
    {
      composite: true,
      also: Symbol.for("maybe"),
    },
  ],
};

const A = { brains: false, q: "phenomenology of the spirit".split("") };
const B = { blah: true };
const C = { B };
const D = { C };
const E = { A };
const F = {};
const G = {
  F,
  popsicle: ["sweet", "action", { dumbfofunded: [true, false, false, 234.43] }],
};
//G["G"] = G;
B["loop"] = A;

const a = { foo: "bar" };
const b: { baz; me?; you? } = { baz: a };
b.me = b;
b.you = a;

// @ts-ignore: WIP
const OBJECT_TO_WALK_01 = {
  happy: { go: "lucky" },
  salad: ["days", "dressing", "bar"],
  ages: [33, 49, 934, { popsicle: [{ mary: "weather" }], interruptible: true }],
  b,
};

const freekey = { faith: "all right" };

const OBJECT_TO_WALK = {
  url: "http://gavinpc.com",
  tags: [
    "veni",
    "vidi",
    "vici",
    b,
    [...seq.range(3, 33, 3)],
    [[...seq.range(3, 33, 2)], G, A, ...seq.range(3, 33, 9), E],
    "sdfkjf",
  ],
  O: new String("goo"),
  P: "gaa",
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  freekey,
  facts: new Map()
    .set("bourne", 3)
    .set("love", true)
    .set(freekey, "blue"),
};

// @ts-ignore: WIP
const projection_tests_0 = {
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  okay: "once upon a time there was a nicens little boy".split(" "),
};

// @ts-ignore: WIP
const dfw = Array.from(depth_first_walk(OBJECT_TO_WALK));

export const reflect = () => ({
  test_walk: walk_object(OBJECT_TO_WALK),
  graph: Dot.serialize_dot(object_graph_to_dot(OBJECT_TO_WALK)),
});
