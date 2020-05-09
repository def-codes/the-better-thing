import * as rs from "@thi.ng/rstream";
import { DomElementExpression } from "./dom-expression";

// rstream has this but other type is `any`
export type ISubscribableSubscriber<T> = rs.ISubscribable<T> &
  rs.ISubscriber<T>;

export interface ElementMessage {
  readonly element: Element;
}

export interface Region {
  readonly id: string;
  readonly element: Element;
}

export interface RegionDefinition {
  readonly id: string;
  readonly content: DomElementExpression;
}

// TODO: Name
export interface DomProcess {
  // implementation writes to this when a placeholder gets an element
  readonly mounted: ISubscribableSubscriber<Region>;

  // implementation writes to this when an element should no longer be used
  readonly unmounted: ISubscribableSubscriber<ElementMessage>;

  // “author” writes to this to inject the given content at the given location
  readonly content: ISubscribableSubscriber<RegionDefinition>;
}
