import * as rs from "@thi.ng/rstream";
import { DomElementExpression } from "./dom-expression";

// path from root to a specific placeholder
export type PlaceholderPath = readonly string[];

export type TemplateContextGetter = (name: string) => TemplateContext;

export type TemplateSink = (
  expression: DomElementExpression,
  context_getter: TemplateContextGetter,
  // TEMP
  path?: PlaceholderPath
) => void;

// rstream has this but other type is `any`
export type ISubscribableSubscriber<T> = rs.ISubscribable<T> &
  rs.ISubscriber<T>;

export interface NewPlaceholderMountedMessage {
  path: PlaceholderPath;
  template_sink: TemplateSink;
}

export interface PlaceholderMountedMessage {
  path: PlaceholderPath;
  element: Element;
}

export interface NewPlaceholderContentMessage {
  path: PlaceholderPath;
  content_source: rs.ISubscribable<DomElementExpression>;
}

export interface PlaceholderContentMessage {
  path: PlaceholderPath;
  content: DomElementExpression;
}

// Everything your template needs to know to interact with its owner dom process
export interface TemplateContext {
  // process: DomProcess;

  // Notify that you're mounted
  // mounted(): void;
  notify_mounted(template_sink: TemplateSink): void;
}

export interface DomProcess {
  // notifier for when the instance associated with this node (the top-level node) is available
  notify_mounted(template_sink: TemplateSink): void;

  // implementation writes to this stream when a placeholder has an element
  readonly mounted: ISubscribableSubscriber<PlaceholderMountedMessage>;

  // “author” writes to this to set a source process for the
  // Not in love this passing around streams... try folding into process mgmt
  // readonly new_content: ISubscribableSubscriber<NewPlaceholderContentMessage>;

  // “author” writes to this to inject the given content at the given location
  readonly content: ISubscribableSubscriber<PlaceholderContentMessage>;
}

export interface DomUpdateMechanism {
  // bind_node?(): TemplateSink;

  /**
   * A side-effecting function that applies the given DOM expression to the
   * given container element using the diffing implementation.  Elements named
   * `placeholder` are handled specially by creating nodes that will notify the
   * given process when they are mounted.
   */
  process_node(
    mounted: (name: string, container: Element) => void,
    container: Element,
    expression: DomElementExpression
  ): void;
}
