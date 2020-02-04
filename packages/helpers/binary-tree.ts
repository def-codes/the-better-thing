// Putting this here for lack of a better place

// mutable...
export interface IBinaryTree<T> {
  size(): number;
  readonly value: T;
  left: IBinaryTree<T> | null;
  right: IBinaryTree<T> | null;
}

/*
export class BinaryTree<T> implements IBinaryTree<T> {
  value: T;
  left: IBinaryTree<T>;
  right: IBinaryTree<T>;

  constructor(value: T, left?: T | null, right?: T | null) {
    this.value = value;
    if (left != null) this.left = new BinaryTree(left);
    if (left != null) this.left = new BinaryTree(left);
  }
}
*/
