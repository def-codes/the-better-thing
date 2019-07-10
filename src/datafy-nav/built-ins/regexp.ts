import { datafy_protocol } from "../protocols";

export const extend_RegExp = {
  datafy() {
    datafy_protocol.extend(RegExp, re => ({
      "regex:source": re.source,
      "regex:flags": re.flags,
    }));
  },
};
