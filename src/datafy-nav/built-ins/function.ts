import { datafy_protocol } from "../datafy-protocol";

export function datafy_Function() {
  datafy_protocol.extend(Function, fn => ({
    // Shouldn't need to do stuff like this... ontology can say e.g.
    // js:functionName sameAs skos:label
    "skos:label": fn.name
  }));
}
