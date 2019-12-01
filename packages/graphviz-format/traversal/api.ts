export interface Traversal<K = any, N = any> {
  // Get the outbound edges from a given node, incuding “label” and target
  links(node: N): Iterable<[K, N]>;
}
