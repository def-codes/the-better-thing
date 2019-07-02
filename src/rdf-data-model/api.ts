// Documentation here is mostly taken from http://rdf.js.org/data-model-spec/

export const STRING_TYPE_IRI = "http://www.w3.org/2001/XMLSchema#string";
export const LANGUAGE_STRING_TYPE_IRI =
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

interface IEquals<T> {
  equals(other: T): boolean;
}

interface TermBase extends IEquals<Term> {
  readonly termType: string;
  readonly value: string;
}

export interface NamedNode extends TermBase {
  readonly "@type": "rdf";
  readonly termType: "NamedNode";
  /** The IRI of the named node (example: “http://example.org/resource”). */
  readonly value: string;
}

export interface BlankNode extends TermBase {
  readonly termType: "BlankNode";

  /** Blank node name as a string, without any serialization specific prefixes,
   * e.g. when parsing, if the data was sourced from Turtle, remove “_:”, if it
   * was sourced from RDF/XML, do not change the blank node name (example:
   * “blank3”). */
  readonly value: string;
}

export interface Literal extends TermBase {
  readonly termType: "Literal";

  /** The text value, unescaped, without language or type (example: “Brad
   * Pitt”). */
  readonly value: string;

  /** The language as lowercase BCP-47 string (examples: “en”, “en-gb”) or an
   * empty string if the literal has no language. */
  readonly language: string;

  /** A `NamedNode` whose IRI represents the datatype of the literal. */
  readonly datatype: NamedNode;

  /** A MELD extension for the corresponding host value when available.  Should
   * be accessed through `valueOf` method. (PROVISIONAL)*/
  runtimeValue?: any;
}

export interface Variable extends TermBase {
  readonly termType: "Variable";

  /** The name of the variable without leading “?” (example: “a”) */
  readonly value: string;
}

/** An instance of `DefaultGraph` represents the default graph. It's only
 * allowed to assign a `DefaultGraph` to the `graph` property of a `Quad`. */
export interface DefaultGraph extends TermBase {
  readonly termType: "DefaultGraph";
  readonly value: "";
}

type Subject = NamedNode | BlankNode | Variable | DefaultGraph;

//export type Term = Subject | Literal | DefaultGraph;
//export type Term = NamedNode | BlankNode | Variable | Literal | DefaultGraph;
export type Term = Subject | Literal;

export interface Quad extends IEquals<Quad> {
  readonly subject: NamedNode | BlankNode | Variable | DefaultGraph;
  readonly predicate: NamedNode | Variable;
  readonly object: Term;
  readonly graph: NamedNode | BlankNode | Variable | DefaultGraph;
}

/** Triple is an alias of Quad. */
export type Triple = Quad;

// The spec says in one place that quad graph can be Term but in another place
// that it can be only these, i.e. any Term but a Literal.
type Graph = DefaultGraph | NamedNode | BlankNode | Variable;

export interface DataFactory {
  /** Returns a new instance of `NamedNode`. */
  namedNode: (value: string) => NamedNode;

  /** Returns a new instance of `BlankNode`. If the value parameter is undefined
   * a new identifier for the blank node is generated for each call.  */
  blankNode: (value?: string) => BlankNode;

  /** Returns a new instance of `Literal`. If `languageOrDatatype` is a
   * `NamedNode`, then it is used for the value of `datatype`. Otherwise
   * `languageOrDatatype` is used for the value of `language`.  */
  literal: (value: string, languageOrDatatype?: string | NamedNode) => Literal;

  /** Returns a new instance of `Variable`. */
  variable: (value: string) => Variable;

  /** Returns an instance of `DefaultGraph`. */
  defaultGraph: () => DefaultGraph;

  /** Returns a new instance of `Quad` with `graph` set to `DefaultGraph`. */
  triple: (subject: Term, predicate: Term, object: Term) => Triple;

  /** Returns a new instance of `Quad`. */
  quad: (subject: Term, predicate: Term, object: Term, graph?: Graph) => Quad;
}

export type Any = Term | Triple | Quad;
