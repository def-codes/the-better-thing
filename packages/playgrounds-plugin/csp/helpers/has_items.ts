// Interesting trick for typeguarding shift and pop as not undefined, from
// https://github.com/Microsoft/TypeScript/issues/10272
export const has_items = <T>(
  array: T[]
): array is { shift(): T; pop(): T } & T[] => array.length > 0;
