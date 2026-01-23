const { body, param, query, validationResult } = require('express-validator');
const { logSecurityEvent } = require('../utils/logger');

// middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // log validation failures for security monitoring
        logSecurityEvent({
            event: 'validation_failed',
            user: req.user?.id || null,
            details: {
                errors: errors.array(),
                path: req.path,
                method: req.method,
                ip: req.ip,
            },
        });

        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array(),
        });
    }

    next();
};

// sanitize string inputs to prevent xss
const sanitizeString = (value) => {
    if (typeof value !== 'string') return value;

    // remove potentially dangerous characters
    return value
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
};

// middleware to sanitize all string inputs in request
const sanitizeInputs = (req, res, next) => {
    // sanitize body
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeString(req.body[key]);
            }
        });
    }

    // sanitize query params
    if (req.query && typeof req.query === 'object') {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeString(req.query[key]);
            }
        });
    }

    // sanitize params
    if (req.params && typeof req.params === 'object') {
        Object.keys(req.params).forEach(key => {
            if (typeof req.params[key] === 'string') {
                req.params[key] = sanitizeString(req.params[key]);
            }
        });
    }

    next();
};

// validate mongodb object ids
const validateObjectId = (paramName) => {
    return param(paramName)
        .isMongoId()
        .withMessage(`${paramName} must be a valid MongoDB ObjectId`);
};

module.exports = {
    handleValidationErrors,
    sanitizeInputs,
    sanitizeString,
    validateObjectId,
};
