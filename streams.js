requirejs(
  ["@thi.ng/transducers", "@thi.ng/rstream", "@def.codes/meld-demo"],
  (tx, rs, { stack }) => {
    // connect a dom element with a process
    // the process has one output?  one standard/default output?
    // or named ports?  ports that it makes enumerable?
    //
    // view keyboard event using `kbd` (where?)
    rs.fromEvent(document.body, "keydown").transform(
      ...stack({ root: "keydown" }, 5)
    );
  }
);
