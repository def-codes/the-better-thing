import { datafy_protocol } from "../datafy-protocol";

export function datafy_Function() {
  // There is no way to know when a function closes over something.
  datafy_protocol.extend(Function, fn => ({
    "@type": "IRI, maybe get from a prototype",
    // Shouldn't need to do stuff like this... ontology can say e.g.
    // js:functionName sameAs skos:label
    "skos:label": fn.name,
    // What would be the IRI for these?
    "javascript:function:arity": fn.length,
    "javascript:function:source": fn.toString()
  }));
}
