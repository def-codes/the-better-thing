// Support the usage of a thing as a subsystem

export interface ISystemCalls {
  // for example
  spawn(name: string, description: object): void;
  // Notify of something having been created
  reflect(
    thing: any,
    // Datafy will be called on the thing.  Any additional description provided
    // will be merged in.
    description?: object,
    // If the caller doesn't specify a name, then the system will assign one
    // there are all kinds of ways that could go wrong...
    name?: string
  ): void;
  // kill(): void;
  // assert(): void;
  // retract(): void;
}

/*
export interface IThing {}

export interface Thingify {
  <T>(description: T, world: World): IThing;
}

export interface Processify {
  <T>(description: T, system: System): IProcess;
}
*/

export interface IDispose {
  dispose(): void;
}

// TBD
export interface IProcess extends Partial<IDispose> {
  // report entailed processes/things
  //
  // Does entailment happen in capacity as a process or as a thing?
  // is there any meaningful difference?
}

// `B` is the “blueprint” type: properties needed to construct
export interface IReify<B extends object> {
  // reify(blueprint: B): IProcess;
}

export interface ISubsystemAdapter<B extends object> extends IReify<B> {
  type_iri: string;
  can_create_contingent_processes: boolean;
}
