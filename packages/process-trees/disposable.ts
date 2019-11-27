/** Indicates that an object may be holding resources. */
export interface IDispose {
  /**
   * Release any resources held by this object.
   *
   * In general, return type will be `void`.  But implementations could use
   * return value to indicate, e.g. whether any action was taken.
   */
  dispose(): any;
}
