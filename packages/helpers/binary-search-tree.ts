import { IBinaryTree } from "./binary-tree";

// or something with a compare method
// or something with a valueOf() that returns value
// aka Ordinal
type Comparable = number | string | bigint | Date;

// -1 means a is less, etc
type OrdinalComparer<T> = (a: T, b: T) => number;

const DEFAULT_COMPARE = (a: Comparable, b: Comparable) =>
  a === b ? 0 : a < b ? -1 : 1;

// maintain invariant that tree always has lesser-valued nodes on the left
export class BinarySearchTree<T extends Comparable> implements IBinaryTree<T> {
  readonly value: T;
  left: BinarySearchTree<T> | null = null;
  right: BinarySearchTree<T> | null = null;
  compare: OrdinalComparer<T>;

  constructor(value: T, compare?: OrdinalComparer<T>) {
    this.value = value;
    this.compare = compare ?? DEFAULT_COMPARE;
  }

  size() {
    return 1 + (this.left?.size() ?? 0) + (this.right?.size() ?? 0);
  }

  insert(value: T) {
    const rel = this.compare(value, this.value);

    // No-op.  Tree already contains value
    if (rel === 0) return;

    if (rel < 0) {
      if (this.left == null) this.left = new BinarySearchTree(value);
      else {
        if (this.compare(value, this.left.value) > 0) {
          const new_left = new BinarySearchTree(value);
          new_left.left = this.left;
          this.left = new_left;
        } else this.left.insert(value);
      }
    } else {
      if (this.right == null) this.right = new BinarySearchTree(value);
      else {
        if (this.compare(value, this.right.value) < 0) {
          const new_right = new BinarySearchTree(value);
          new_right.right = this.right;
          this.right = new_right;
        } else this.right.insert(value);
      }
    }
  }
}

BinarySearchTree.prototype["@type"] ===
  ["dads:BinaryTree", "dads:BinarySearchTree"];
