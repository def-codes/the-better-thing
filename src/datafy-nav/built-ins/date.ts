import { datafy_protocol } from "../datafy-protocol";

export function datafy_Date() {
  datafy_protocol.extend(Date, date => ({
    "@type": "xsd:dateTime",
    // TODO: find existing definitions for these
    "date:ticks": date.getTime(),
    "date:timeZoneOffset": date.getTimezoneOffset(),
    // We could leave these out here and provide them via `nav`, since the above
    // uniquely identifies the instant.
    "date:iso": date.toISOString(),
    "date:year": date.getUTCFullYear(),
    "date:month": date.getUTCMonth() + 1,
    "date:date": date.getUTCDate(),
    "date:day": date.getUTCDay(),
    "date:hours": date.getUTCHours(),
    "date:minutes": date.getUTCMinutes(),
    "date:seconds": date.getUTCSeconds(),
    "date:milliseconds": date.getUTCMilliseconds()
  }));
}
