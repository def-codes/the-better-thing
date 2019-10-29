// Not sure what to call this...
// late binding for function call

export interface LazyCall<T, A extends any[] = any[]> {
  readonly fn: (...args: A) => T;
  args: A;
}

// support typed bindings using call-site inference
export const binding = <T, A extends any[] = any[]>(
  fn: (...args: A) => T,
  ...args: A
): LazyCall<T, A> => ({ fn, args });
