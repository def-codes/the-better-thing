import { datafy_protocol } from "../protocols";

export const extend_Error = {
  datafy() {
    datafy_protocol.extend(Error, e => ({
      "@context": "http://meld/javascript/error",
      "error:name": e.name,
      "error:message": e.message,
      "error:stack": e.stack
    }));
  }
};
