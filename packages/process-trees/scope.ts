// A scope is just a system
// A scope is anything with the power to create processes
// scopes form a navigable tree --- but avoid reference leakage
//interface Scope {
// a scope belongs to a scope
//readonly parent;
//}
interface ISubsystem {
  // the names of the children are unique
  readonly children: ReadonlySet<string>;
  readonly state;
  // subscribable for children

  // who tells you to die?
  die();
}

// A subsystem in which assertions drive the creation and updating of things
// But --- assertions from *within* the system?
interface IReifiedSubsystem extends ISubsystem {
  // needs an input port for claims, then?
  // or at least, needs some kind of incoming value
  // because *this* subsystem is making the claims, right?
}

// A subsystem in which things drive the claims
interface IReflectedSubsystem extends ISubsystem {
  // needs an input for commands
  // needs a way to notify when there are new child processes
}
