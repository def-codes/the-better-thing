import { datafy_protocol } from "../datafy-protocol";

export function datafy_Error() {
  datafy_protocol.extend(Error, e => ({
    "@context": "http://meld/javascript/error",
    "error:name": e.name,
    "error:message": e.message,
    "error:stack": e.stack
  }));
}
