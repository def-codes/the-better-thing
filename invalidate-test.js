const assert = require("assert");
const path = require("path");
const fs = require("fs");
const { equiv } = require("@thi.ng/equiv");
const {
  invalidate,
  transitive_invalidate,
} = require("@def.codes/node-live-require");

const TEST_CASES = {
  "require throws when module_not_defined"() {
    try {
      require("./nonexistent");
      assert.fail("expected error");
    } catch (error) {
      return;
    }
  },
  "defined module returns its exports"({ define }) {
    const name1 = "./temp-lib-1";

    define(name1, "module.exports = {version: 1}");
    assert.deepStrictEqual(require(name1), { version: 1 });
  },
  "modified definition is not reflected on subsequent requires"({ define }) {
    const name1 = "./temp-lib-1";

    define(name1, "module.exports = {version: 1}");
    assert.deepStrictEqual(require(name1), { version: 1 });

    define(name1, "module.exports = {version: 2}");
    assert.deepStrictEqual(require(name1), { version: 1 });
  },
  "modified definition is reflected after shallow invalidation"({ define }) {
    const name1 = "./temp-lib-1";

    define(name1, "module.exports = {version: 1}");
    assert.deepStrictEqual(require(name1), { version: 1 });

    invalidate(name1, require);

    define(name1, "module.exports = {version: 2}");
    assert.deepStrictEqual(require(name1), { version: 2 });
  },
  "modified definition from transitive import is not reflected after shallow invalidation"({
    define,
  }) {
    const name1 = "./temp-lib-1";
    const name2 = "./temp-lib-2";

    define(name1, `module.exports = {version: 1, subversion: require('${name2}').version}`);
    define(name2, `module.exports = {version: 100}`);
    assert.deepStrictEqual(require(name1), { version: 1, subversion: 100 });

    define(name2, `module.exports = {version: 101}`);
    assert.deepStrictEqual(require(name1), { version: 1, subversion: 100 });
  },
  "modified definition from transitive import is reflected after deep invalidation"({
    define,
  }) {
    const name1 = "./temp-lib-1";
    const name2 = "./temp-lib-2";

    define(name1, `module.exports = {version: 1, subversion: require('${name2}').version}`);
    define(name2, `module.exports = {version: 100}`);
    assert.deepStrictEqual(require(name1), { version: 1, subversion: 100 });

    define(name2, `module.exports = {version: 101}`);
    assert.deepStrictEqual(require(name1), { version: 1, subversion: 100 });

    transitive_invalidate(name2, require);

    assert.deepStrictEqual(require(name1), { version: 1, subversion: 101 });
  },
};

const run_test = ([name, test]) => {
  const defined = new Set();

  const resolve = module_id => path.join(process.cwd(), module_id + ".js");

  function define(id, code) {
    fs.writeFileSync(resolve(id), code);
    defined.add(id);
  }

  function undefine(id) {
    fs.unlinkSync(resolve(id));
  }

  try {
    // This don't work
    // require.cache = {};
    // This do
    for (const key of Object.keys(require.cache)) delete require.cache[key];

    test({ define });
    return { name, pass: true };
  } catch (error) {
    return { name, pass: false, error };
  } finally {
    try {
      // clear any temp files created during test
      defined.forEach(undefine);
    } catch (error) {
      console.error(`ERROR DURING CLEANUP for test : ${name}`);
      throw error;
    }
  }
};

const run_tests = tests => Object.entries(tests).map(run_test);

const format_result = result =>
  result.pass ? `PASS! ${result.name}` : `FAIL! ${result.name} ${result.error}`;

const format_results = results => results.map(format_result).join("\n");

console.log(format_results(run_tests(TEST_CASES)));
