import { ECMAScriptRuntimeHost } from "./api";

export const make_runtime_host = (): ECMAScriptRuntimeHost => {
  return {
    "@type": "http://def.codes/ECMAScript/RuntimeHost",
    eval_sink(code) {
      eval(code);
    },
  };
};
