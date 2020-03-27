export interface StateMachineStateDescription {
  readonly label?: string;
  readonly terminal?: boolean;
}

export interface StateMachineTransitionDescription {
  readonly label?: string;
  // PROVISIONAL
  readonly postcondition?: any;
}

// a somewhat less simple state machine spec
export interface StateMachineSpec<
  S extends string = string,
  T extends string = string
> {
  readonly states: Record<S, StateMachineStateDescription>;
  // Transitions are not necessarily unique by key
  readonly transitions: readonly (readonly [
    S,
    T,
    S,
    StateMachineTransitionDescription?
  ])[];
  initial_state: S;
}

/* Can't get this through inference
export const state_machine = <S extends string, T extends string>(
  states: Record<S, StateMachineStateDescription>,
  transitions: StateMachineSpec<S, T>["transitions"],
  initial_state: S
): StateMachineSpec<S, T> => ({ states, transitions, initial_state });
*/
