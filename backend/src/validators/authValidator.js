const { body } = require('express-validator');

// validation rules for user registration
exports.registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('username can only contain letters, numbers, and underscores'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('invalid email format')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('password must contain uppercase, lowercase, and number'),
];

// validation rules for user login
exports.loginValidation = [
    body('identifier')
        .trim()
        .notEmpty()
        .withMessage('username or email is required'),
    body('password')
        .notEmpty()
        .withMessage('password is required'),
];

// validation rules for forgot password
exports.forgotPasswordValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('invalid email format')
        .normalizeEmail(),
];

// validation rules for reset password
exports.resetPasswordValidation = [
    body('token')
        .notEmpty()
        .withMessage('reset token is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('password must contain uppercase, lowercase, and number'),
];
