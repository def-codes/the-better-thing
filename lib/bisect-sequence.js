/** Split a finite sequence into two disjunct lists based on a predicate. */
exports.bisect = (items, predicate) => {
  const _true = [];
  const _false = [];
  for (const item of items) (predicate(item) ? _true : _false).push(item);
  return [_true, _false];
};
