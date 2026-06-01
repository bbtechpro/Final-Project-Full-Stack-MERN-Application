// utils/catchAsync.js
/**
 * Wraps an async function, catching any errors and passing them to next().
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
