// API

export interface ValueSpaceDescription {}

// K is the space of keys known by this spec
// It should not be necessary that a single object have knowledge of all possible specs
// actual operations need to be provided a dictionary one way or another
// I think the only value of K here is that you can check whether references come from this spec
// I have tried this on another experiment, and I don't suspect the juice is worth the squeeze
// may even be misleading because again these lookups are going to be late bound anyway
export type ValueSpaceSchema<K extends string = string> = Record<
  K,
  ValueSpaceDescription
>;

// constructor
// conversion
// test
export const example_value_space_schema: ValueSpaceSchema = {
  // generated type should be Readonly<{hours: number, minutes: number}>
  // i.e. other constraints are thrown out
  TimeOfDay: {
    type: "string",
    keys: {
      hours: {
        spec: { and: [{ type: "number" }, { pred: { gte: 0 } }, { lte: 23 }] },
      },
      minutes: {
        spec: { and: [{ type: "number" }, { pred: { gte: 0 } }, { lte: 59 }] },
      },
    },
  },
};
