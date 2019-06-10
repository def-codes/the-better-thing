// basic rdf.js implementation (http://rdf.js.org/)

const STRING_TYPE_IRI = "http://www.w3.org/2001/XMLSchema#string";
const LANGUAGE_STRING_TYPE_IRI =
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

function base_term_equals(other) {
  return this.termType === other.termType && this.value === other.value;
}

function namedNode(value) {
  this.value = value;
}
namedNode.prototype.termType = "NamedNode";
namedNode.prototype.equals = base_term_equals;

const STRING_DATATYPE = new namedNode(STRING_TYPE_IRI);
const LANGUAGE_STRING_DATATYPE = new namedNode(LANGUAGE_STRING_TYPE_IRI);

let blankNodeCount = 0;

const add_readonly = (o, name, value) =>
  Object.defineProperty(o, name, { value, enumerable: true });

function blankNode(value) {
  this.value = value || `b${++blankNodeCount}`;
}
add_readonly(blankNode.prototype, "termType", "BlankNode");
blankNode.prototype.equals = base_term_equals;

function variable(value) {
  this.value = value;
}
add_readonly(variable.prototype, "termType", "Variable");
variable.prototype.equals = base_term_equals;

function defaultGraph() {}
add_readonly(defaultGraph.prototype, "termType", "DefaultGraph");
add_readonly(defaultGraph.prototype, "value", "");
defaultGraph.prototype.equals = base_term_equals;

const DEFAULT_DEFAULT_GRAPH = new defaultGraph();

function literal(value, languageOrDatatype) {
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
literal.prototype.equals = function literal_equals(other) {
  return (
    other.termType === "Literal" &&
    this.value === other.value &&
    this.language === other.language &&
    this.datatype.equals(other.datatype)
  );
};

function quad_equals(other) {
  return (
    this.subject.equals(other.subject) &&
    this.predicate.equals(other.predicate) &&
    this.object.equals(other.object) &&
    this.graph.equals(other.graph)
  );
}

function triple(subject, predicate, object) {
  this.subject = subject;
  this.predicate = predicate;
  this.object = object;
}
triple.prototype.graph = DEFAULT_DEFAULT_GRAPH;
triple.prototype.equals = quad_equals;

function quad(subject, predicate, object, graph) {
  this.subject = subject;
  this.predicate = predicate;
  this.object = object;
  this.graph = graph || DEFAULT_DEFAULT_GRAPH;
}
quad.prototype.equals = quad_equals;

const dataFactory = {
  namedNode: value => new namedNode(value),
  blankNode: value => new blankNode(value),
  literal: (value, lord) => new literal(value, lord),
  variable: value => new variable(value),
  defaultGraph: () => new defaultGraph(),
  triple: (s, p, o) => new triple(s, p, o),
  quad: (s, p, o, g) => new quad(s, p, o, g)
};

/////////// toString extensions
namedNode.prototype.toString = function() {
  return `<${this.value}>`;
};
blankNode.prototype.toString = function() {
  return `_:${this.value}`;
};
variable.prototype.toString = function() {
  return `?${this.value}`;
};
variable.prototype.toString = function() {
  return `<default graph>`;
};
literal.prototype.toString = function() {
  // TODO: Doesn't escape quotes.  What are the rules for this?
  return this.language
    ? `"${this.value}"@${this.language}`
    : this.datatype.equals(STRING_DATATYPE)
    ? `"${this.value}"`
    : `"${this.value}"^^${this.datatype}`;
};
triple.prototype.toString = function() {
  return `${this.subject} ${this.predicate} ${this.object}`;
};

/// an rdf.js implementation that keeps reference identity between equivalent
/// values.  it's built on top of the vanilla impl.
// Shamelessly steals the `id` idea from N3

// Effectively duplicates toString on main impl
const id_of = term => {
  switch (term.termType) {
    case "NamedNode":
      return term.value;
    case "BlankNode":
      return `_:${term.value}`;
    case "Variable":
      return `?${term.value}`;
    case "Literal":
      return term.language
        ? `"${term.value}"@${term.language}`
        : term.datatype.value === STRING_TYPE_IRI
        ? `"${term.value}"`
        : `"${term.value}"^^${term.datatype}`;
  }
};

const makeIdentityFactory = baseFactory => {
  const terms = new Map();

  // Could be more efficient?  Instantiates the term to get the ID.
  const normalize = term => {
    const id = id_of(term);
    if (terms.has(id)) return terms.get(id);
    terms.set(id, term);
    return term;
  };

  /** Wrap a term factory function so that it returns identical values for
   * equivalent terms. */
  const wrap_term = fn => (...args) => normalize(fn(...args));

  return {
    blankNode: wrap_term(baseFactory.blankNode),
    // This one already uses a singleton
    defaultGraph: baseFactory.defaultGraph,
    literal: wrap_term(baseFactory.literal),
    namedNode: wrap_term(baseFactory.namedNode),
    variable: wrap_term(baseFactory.variable),

    // These don't need to return identical quads, but they do need to return
    // quads with identical terms.
    triple: (subject, predicate, object) =>
      baseFactory.triple(
        normalize(subject),
        normalize(predicate),
        normalize(object)
      ),
    quad: (subject, predicate, object, graph) =>
      baseFactory.quad(
        normalize(subject),
        normalize(predicate),
        normalize(object),
        normalize(graph)
      ),
    normalize
  };
};

var rdf = makeIdentityFactory(dataFactory);
