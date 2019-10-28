import { datafy_protocol } from "@def.codes/datafy-nav";

datafy_protocol.extend("@imaginary", imaginary => {
  console.log("My beloved", imaginary);
});

// Reify primitives

const PRIMITIVE: PropertyDescriptorMap = {
  "@context": {
    // Not sure if I want to see this
    // enumerable: true,
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
    Object.assign(Object.create(PRIMITIVE), { "@type": type, value })
  );

// Anyway, can we do this automatically if these are built-ins?

const EVENT_PROTOTYPE = { "@type": "browser:Event" };
const KEYBOARD_EVENT_PROTOTYPE = {
  // In normal practice, if these are subclasses, only most specific will be listed
  "@type": ["browser:KeyboardEvent", "browser:Event"],
};
const MOUSE_EVENT_PROTOTYPE = {
  // In normal practice, if these are subclasses, only most specific will be listed
  "@type": ["browser:MouseEvent", "browser:Event"],
};
const DRAG_EVENT_PROTOTYPE = {
  // In normal practice, if these are subclasses, only most specific will be listed
  "@type": ["browser:DragEvent", "browser:MouseEvent", "browser:Event"],
};

const DATA_TRANSFER_PROTOTYPE = { "@type": "browser:DataTransfer" };
const DATA_TRANSFER_ITEM_LIST_PROTOTYPE = {
  "@type": "browser:DataTransferItemList",
};
const DATA_TRANSFER_ITEM_PROTOTYPE = { "@type": "browser:DataTransferItem" };

datafy_protocol.extend(Event, event =>
  Object.assign(Object.create(EVENT_PROTOTYPE), {
    bubbles: event.bubbles,
    cancelable: event.cancelable,
    composed: event.composed,
  })
);

datafy_protocol.extend(KeyboardEvent, event =>
  Object.assign(Object.create(MOUSE_EVENT_PROTOTYPE), {
    key: event.key,
    shift: event.shiftKey,
    ctrl: event.ctrlKey,
    alt: event.altKey,
    meta: event.metaKey,
  })
);

datafy_protocol.extend(MouseEvent, event =>
  Object.assign(Object.create(MOUSE_EVENT_PROTOTYPE), {
    x: event.clientX,
    y: event.clientY,
  })
);

datafy_protocol.extend(DragEvent, event =>
  Object.assign(Object.create(DRAG_EVENT_PROTOTYPE), {
    dataTransfer: event.dataTransfer,
  })
);

datafy_protocol.extend(DataTransfer, transfer =>
  Object.assign(Object.create(DATA_TRANSFER_PROTOTYPE), {
    // So is it your job to datafy here?
    [`co:hasPart`]: transfer.items,
    [`co:hasType`]: transfer.types,
  })
);

datafy_protocol.extend(DataTransferItemList, list =>
  Object.assign(Object.create(DATA_TRANSFER_ITEM_LIST_PROTOTYPE), {
    [`co:count`]: list.length,
  })
);

datafy_protocol.extend(DataTransferItem, item =>
  Object.assign(Object.create(DATA_TRANSFER_ITEM_PROTOTYPE), {
    // Kind versus type?
    [`kind`]: item.kind,
    [`type`]: item.type,
  })
);

export const hello = "world";
