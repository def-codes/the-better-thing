import { datafy_protocol } from "@def.codes/datafy-nav";

console.log(`line 3`);

datafy_protocol.extend("@imaginary", imaginary => {
  console.log("My beloved", imaginary);
});

// Hypothetical -- reify primitives

const PRIM_CTX = {
  "@context": {
    rdf: "http://rdf..syntax",
    xsd: "http://xml schema",
    value: "rdf:value",
  },
};

// Hunch you'll want these back

// datafy_protocol.extend(Boolean, thing => ({
//   ...PRIM_CTX,
//   "@type": "xsd:boolean",
//   thing,
// }));

// datafy_protocol.extend(Number, thing => ({
//   ...PRIM_CTX,
//   "@type": "xsd:double",
//   thing,
// }));

// datafy_protocol.extend(String, value => ({
//   ...PRIM_CTX,
//   "@type": "xsd:string",
//   value,
// }));

// const prim = (P, t) =>
// 	datafy_protocol.extend(P, value => ({ ...PRIM_CTX, "@type": t, value }));

for (const [t, P] of Object.entries({
  "xsd:boolean": Boolean,
  "xsd:double": Number,
  "xsd:string": String,
}))
  datafy_protocol.extend(P, value => ({ ...PRIM_CTX, "@type": t, value }));

export const hello = "world";
