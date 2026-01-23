// async handler wrapper to eliminate try-catch boilerplate in controllers
// wraps async route handlers and automatically catches errors, passing them to express error handler

/**
 * wraps an async function to catch any errors and pass them to next()
 * eliminates need for try-catch blocks in every controller
 * 
 * @param {Function} fn - async controller function
 * @returns {Function} wrapped function with error handling
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
