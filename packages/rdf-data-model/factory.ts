// basic rdf.js implementation (http://rdf.js.org/)

import * as rdf from "./api";

function base_term_equals(other: rdf.Term) {
  return this.termType === other.termType && this.value === other.value;
}

function namedNode(value: string) {
  this.value = value;
}
namedNode.prototype.termType = "NamedNode";
namedNode.prototype.equals = base_term_equals;

const STRING_DATATYPE = new namedNode(rdf.STRING_TYPE_IRI);
const LANGUAGE_STRING_DATATYPE = new namedNode(rdf.LANGUAGE_STRING_TYPE_IRI);

let blankNodeCount = 0;

const add_readonly = (o: object, name: string, value: any) =>
  Object.defineProperty(o, name, { value, enumerable: true });

function blankNode(value?: string) {
  this.value = value || `b${++blankNodeCount}`;
}
add_readonly(blankNode.prototype, "termType", "BlankNode");
blankNode.prototype.equals = base_term_equals;

function variable(value: string) {
  this.value = value;
}
add_readonly(variable.prototype, "termType", "Variable");
variable.prototype.equals = base_term_equals;

function defaultGraph() {}
add_readonly(defaultGraph.prototype, "termType", "DefaultGraph");
add_readonly(defaultGraph.prototype, "value", "");
defaultGraph.prototype.equals = base_term_equals;

const DEFAULT_DEFAULT_GRAPH = new defaultGraph();

function literal(value: string, languageOrDatatype?: string | rdf.NamedNode) {
  this.value = value;

  if (typeof languageOrDatatype === "string") {
    this.language = languageOrDatatype;
    this.datatype = LANGUAGE_STRING_DATATYPE;
  } else {
    this.language = "";
    this.datatype = languageOrDatatype || STRING_DATATYPE;
  }
}
add_readonly(literal.prototype, "termType", "Literal");
literal.prototype.equals = function literal_equals(other: rdf.Term) {
  return (
    other.termType === "Literal" &&
    this.value === other.value &&
    this.language === other.language &&
    this.datatype.equals(other.datatype)
  );
};
/** “This method provides access to a corresponding host environment specific
 * native value, where one exists.” From the first attempt at an RDF interface
 * spec: (https://www.w3.org/TR/rdf-interfaces/#literals) */
literal.prototype.valueOf = function literal_valueOf(this: rdf.Literal) {
  // TEMP.  how to do this?
  // I don't know but if anything || should now be ??
  return this.runtimeValue || this.value;
};

function quad_equals(other: rdf.Quad) {
  return (
    this.subject.equals(other.subject) &&
    this.predicate.equals(other.predicate) &&
    this.object.equals(other.object) &&
    this.graph.equals(other.graph)
  );
}

function triple(subject: rdf.Term, predicate: rdf.Term, object: rdf.Term) {
  this.subject = subject;
  this.predicate = predicate;
  this.object = object;
}
triple.prototype.graph = DEFAULT_DEFAULT_GRAPH;
triple.prototype.equals = quad_equals;

function quad(
  subject: rdf.Term,
  predicate: rdf.Term,
  object: rdf.Term,
  graph?: rdf.DefaultGraph | rdf.NamedNode | rdf.BlankNode | rdf.Variable
) {
  this.subject = subject;
  this.predicate = predicate;
  this.object = object;
  this.graph = graph || DEFAULT_DEFAULT_GRAPH;
}
quad.prototype.equals = quad_equals;

export const dataFactory: rdf.DataFactory = {
  namedNode: value => new namedNode(value),
  blankNode: value => new blankNode(value),
  literal: (value, lord) => new literal(value, lord),
  variable: value => new variable(value),
  defaultGraph: () => new defaultGraph(),
  triple: (s, p, o) => new triple(s, p, o),
  quad: (s, p, o, g) => new quad(s, p, o, g),
};

/////////// toString extensions
namedNode.prototype.toString = function(this: rdf.NamedNode) {
  return `<${this.value}>`;
};
blankNode.prototype.toString = function(this: rdf.BlankNode) {
  return `_:${this.value}`;
};
variable.prototype.toString = function(this: rdf.Variable) {
  return `?${this.value}`;
};
defaultGraph.prototype.toString = function() {
  return `<default graph>`;
};
literal.prototype.toString = function(this: rdf.Literal) {
  // TODO: Doesn't escape quotes.  What are the rules for this?
  return this.language
    ? `"${this.value}"@${this.language}`
    : this.datatype.equals(STRING_DATATYPE)
    ? `"${this.value}"`
    : `"${this.value}"^^${this.datatype}`;
};
triple.prototype.toString = function(this: rdf.Triple) {
  return `${this.subject} ${this.predicate} ${this.object}`;
};
