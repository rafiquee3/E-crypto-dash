// Minimal shim for `until-async` for Jest environment
// Provides `until` that accepts a promise or async function and resolves to [err, result]
function until(fn, ...args) {
  try {
    const val = typeof fn === 'function' ? fn(...args) : fn;
    if (val && typeof val.then === 'function') {
      return val.then((res) => [null, res]).catch((err) => [err]);
    }
    return Promise.resolve([null, val]);
  } catch (err) {
    return Promise.resolve([err]);
  }
}

module.exports = { until };
