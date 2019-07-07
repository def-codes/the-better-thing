// for things with explicit datafy method
// things may still be datafiable by way of protocol registration
export interface IDatafiable {
  datafy(): object; // any?
}

export interface INavable {
  nav(): any; // ???
}
