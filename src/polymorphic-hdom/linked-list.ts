// Singly-linked list
export class LinkedList<T> implements Iterable<T> {
  readonly value: T;
  readonly next: LinkedList<T> | undefined;
  readonly count: number;

  constructor(value: T, next?: LinkedList<T>) {
    this.value = value;
    this.next = next;
    this.count = next ? next.count + 1 : 1;
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
