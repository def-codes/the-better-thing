// singleton runtime registry

const ids_by_thing = new WeakMap<object, string>();
// problem with this is, it's not weak
// holds reference so defeats the purpose of weak map
const things = new Map<string, object>();

let count = 0;

const next_id = () => count++;

class RuntimeRegistry {
  // call datafy on the object with the given id
  datafy(id: string): object | undefined {
    return {};
  }

  register(thing: object): string {
    // no-op if already registered
    if (ids_by_thing.has(thing)) return;
    const id = `thing-${next_id()}`;
    ids_by_thing.set(thing, id);
    // things.set(id, thing)
    return id;
  }
}

export const registry = new RuntimeRegistry();
