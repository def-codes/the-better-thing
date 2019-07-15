// Composable (hdom) template operations
// resembles function “advice” as in Emacs Lisp
// order is not guaranteed, so these assertions do not conflict

type Falsy = false | null | undefined;

// not to be confused with canvas RenderingContext...
export interface RenderContext extends ReadonlyArray<any> {
  // It's a component... a macroexpandable term.
  show: unknown;
}

/** A possibly-parameterized descriptor of an abstract quality of a thing. */
export interface Trait {
  /** Unique identifier for this type of trait, preferably an IRI. */
  id: string;
  [key: string]: any;
}

// I don't want to require this on all impl's, but this would allow traits to be
// distinguished in matchers
export interface QualifiedTrait extends Trait {
  "@type": "some specific IRI";
}

export interface TraitQuery {
  (thing: any, context: RenderContext): Trait | Trait[] | Falsy;
}

export interface LiteralTemplate extends Array<any> {}
export interface TemplateFunction {
  (value: any, context: RenderContext): Template;
}

export type Template = LiteralTemplate | TemplateFunction;

// Mostly general to templates.  Certainly for HTML & SVG, but, except for
// “has-class” could apply to any hdom implementation.
export interface DomAssert<T extends string> {
  type: T;
}

// For DOM elements only (not HDOM components)
export interface AssertHasClass extends DomAssert<"has-class"> {
  class: string;
}

// For DOM elements only (not HDOM components)
export interface AssertHasElement extends DomAssert<"has-element"> {
  tag: string;
}

export interface AssertContains extends DomAssert<"contains"> {
  content: Template;
}

export interface AssertIsWrappedBy extends DomAssert<"is-wrapped-by"> {
  wrap: (template: Template) => LiteralTemplate;
}

// PROVISIONAL. may mess with HDOM in practice.
interface AssertHasContentBefore extends DomAssert<"has-content-before"> {
  content: Template;
}
interface AssertHasContentAfter extends DomAssert<"has-content-after"> {
  content: Template;
}

// maybe
// -- assert style rule (probably not -- can conflict)
// -- assert attribute [has]

export type DomAssertion =
  | AssertHasClass
  | AssertHasElement
  | AssertContains
  | AssertIsWrappedBy;
//  | AssertHasContentBefore
//  | AssertHasContentAfter;

type DomInterpretation = DomAssertion | DomAssertion[] | Falsy;

export interface DomTraitInterpreterFunction {
  (trait: Trait): DomInterpretation;
}

// TODO: does this need to return/know what implementation (HTML/SVG)?
// TODO: does this need to return/know what trait it interprets?
export type DomTraitInterpreter =
  | DomInterpretation
  | DomTraitInterpreterFunction;
