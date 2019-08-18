// An AMD subset permitting only named, literal definitions.
(function() {
  const advisable = fn => {
    const advice = {};
    return Object.assign(
      (...args) => {
        return Object.values(advice).reduce((acc, f) => f(acc));
      },
      { advice }
    );
  };

  const make_sync_define = () => {
    const definitions = Object.create(null);

    function define(id, value) {
      definitions[id] = value;
      // add value to definitions under name id
      // if value is a function, should it be evaluated?
      // if it's a function, then it must be a thunk, as it will receive no arguments
    }
  };
})();
