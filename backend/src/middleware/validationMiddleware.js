const { validationResult } = require('express-validator');

/**
 * middleware to validate request using express-validator
 * eliminates duplicate validation error checking in controllers
 * 
 * @param {Object} req - express request
 * @param {Object} res - express response
 * @param {Function} next - next middleware
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = { validateRequest };
