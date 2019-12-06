exports.shallow_clone = o => (Array.isArray(o) ? [...o] : { ...o });
exports.cheap_clone = o => JSON.parse(JSON.stringify(o));
