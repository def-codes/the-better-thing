// Support the usage of a thing as a subsystem

export interface IDispose {
  dispose(): void;
}

// TBD
export interface IProcess extends Partial<IDispose> {}

// `B` is the “blueprint” type: properties needed to construct
export interface IReify<B extends object> {
  reify(blueprint: B): IProcess;
}

export interface ISubsystemAdapter<B extends object> extends IReify<B> {
  can_create_contingent_processes: boolean;
}
