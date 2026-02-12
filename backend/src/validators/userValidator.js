const { body } = require('express-validator');

// validation rules for user profile updates
exports.updateProfileValidation = [
    body('nickname')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('nickname must be between 2 and 50 characters'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('bio must not exceed 500 characters'),
    body('gender')
        .optional()
        .isIn(['male', 'female', 'other', 'prefer not to say'])
        .withMessage('invalid gender value'),
    body('country')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('country must be between 2 and 100 characters'),
];

// validation rules for username update
exports.updateUsernameValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('username can only contain letters, numbers, and underscores'),
];

// validation rules for email update
exports.updateEmailValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('invalid email format')
        .normalizeEmail(),
];

// validation rules for password update
exports.updatePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('new password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('password must contain uppercase, lowercase, and number'),
];

// validation for personalizing profile
exports.updatePersonalizationValidation = [
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
    body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']).withMessage('Invalid gender'),
];
