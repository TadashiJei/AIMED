/**
 * Wraps an async route handler to catch any errors and pass them to the error middleware
 * @param {Function} fn - The async route handler function
 * @returns {Function} - Express middleware function
 */
exports.catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
