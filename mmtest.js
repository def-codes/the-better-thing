const rs = require("@thi.ng/rstream");
const { module_stream } = require("@def.codes/meld");

const [, , module_name] = process.argv;

const source = module_stream(module_name, { reference_path: process.cwd() });

rs.stream(source).subscribe(rs.trace("MODULE RESOLVED"));
