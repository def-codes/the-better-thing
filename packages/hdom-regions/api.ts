import * as rs from "@thi.ng/rstream";
import type { DomElementExpression } from "./dom-expression";

export * from "./dom-expression";

// rstream has this but other type is `any`
export type ISubscribableSubscriber<T> = rs.ISubscribable<T> &
  rs.ISubscriber<T>;

export interface Region {
  readonly id: string;
  readonly element: Element;
}

export interface RegionDefinition {
  readonly id: string;
  readonly content: DomElementExpression;
}

export interface IDomRegionCoordinator {
  // “author” writes to this to inject the given content at the given location
  readonly ports: {
    // Whats the type here?
    get(id: string): ISubscribableSubscriber<DomElementExpression>;
  };

  // Essentially a shortcut
  define(port: string, content: DomElementExpression): void;

  // implementation writes to this when a placeholder gets an element
  readonly mounted: ISubscribableSubscriber<Region>;

  // implementation writes to this when an element should no longer be used
  readonly unmounted: ISubscribableSubscriber<Region>;
}
