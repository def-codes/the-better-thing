import { datafy_protocol } from "@def.codes/datafy-nav";

datafy_protocol.extend("@imaginary", imaginary => {
  console.log("My beloved", imaginary);
});

// Reify primitives

const PRIMITIVE: PropertyDescriptorMap = {
  "@context": {
    enumerable: true,
    value: {
      rdf: "http://rdf..syntax",
      xsd: "http://xml/schema",
      value: "rdf:value",
    },
  },
};

for (const [type, Protocol] of Object.entries({
  "xsd:boolean": Boolean,
  "xsd:double": Number,
  "xsd:string": String,
}))
  datafy_protocol.extend(Protocol, value =>
    Object.create({ "@type": type, value }, PRIMITIVE)
  );

const EVENT_PROTOTYPE = { "@type": "browser:Event" };

datafy_protocol.extend(Event, event =>
  Object.create(EVENT_PROTOTYPE, {
    bubbles: { enumerable: true, value: event.bubbles },
    cancelable: { enumerable: true, value: event.cancelable },
    composed: { enumerable: true, value: event.composed },
  })
);

export const hello = "world";
