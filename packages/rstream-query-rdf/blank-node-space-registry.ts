import { MonotonicBlankNodeSpace } from "./blank-node-space";

class BlankNodeSpaceRegistry {
  private readonly _spaces = new Map<number, MonotonicBlankNodeSpace>();

  create(): { id: number; space: MonotonicBlankNodeSpace } {
    const space = new MonotonicBlankNodeSpace();
    const id = this._spaces.size + 1;
    this._spaces.set(id, space);
    return { space, id };
  }
  get(id: number): MonotonicBlankNodeSpace | undefined {
    return this._spaces.get(id);
  }
}

// using a singleton until we have datasets
export const blank_node_space_registry = new BlankNodeSpaceRegistry();
