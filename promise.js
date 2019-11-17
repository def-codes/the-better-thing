const pt = require("@def.codes/process-trees");

const timeout = (ms, value) =>
  new Promise(resolve => setTimeout(resolve(value), ms));

const blah = timeout(100, "abc");
const blahproto = Object.getPrototypeOf(blah);
// const blahconstr = blah.constructor;
// const blahconstrproto = blahconstr.prototype;

console.log(`blah`, blah);
console.log(`blahproto`, blahproto);
// console.log(`blahconstr`, blahconstr);
// console.log(`blahconstrproto`, blahconstrproto);

// console.log(`blahconstrproto.notify`, blahconstrproto.notify);
console.log(`Promise`, Promise.prototype.notify);

blah.addListener("state", state => {
  console.log(`YO process state is `, state);
});

blah.then(value => console.log(`HAAAAY !value`, value));
