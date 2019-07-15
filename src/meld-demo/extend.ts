import { datafy_protocol } from "@def.codes/datafy-nav";

console.log(`line 3`);

datafy_protocol.extend("@imaginary", imaginary => {
  console.log("My beloved", imaginary);
});

datafy_protocol.extend(Number, number => ({
  "@context": {
    rdf: "http://rdf..syntax",
    xsd: "http://xml schema",
    value: "rdf:value",
  },
  "@type": "xsd:double",
  value: number,
}));
