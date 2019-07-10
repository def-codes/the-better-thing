// Singly-linked list
export class LinkedList<T> implements Iterable<T> {
  readonly value: T;
  readonly next: LinkedList<T> | undefined;

  constructor(value: T, next?: LinkedList<T>) {
    this.value = value;
    this.next = next;
  }

  cons(value: T) {
    return new LinkedList(value, this);
  }

  *[Symbol.iterator]() {
    let current: LinkedList<T> | undefined = this;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}
