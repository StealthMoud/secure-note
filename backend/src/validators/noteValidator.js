const { body } = require('express-validator');

// validation rules for creating a note
exports.createNoteValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('title is required')
        .isLength({ min: 1, max: 200 })
        .withMessage('title must be between 1 and 200 characters'),
    body('content')
        .trim()
        .notEmpty()
        .withMessage('content is required'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('tags must be an array'),
    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('each tag must be between 1 and 30 characters'),
];

// validation rules for updating a note
exports.updateNoteValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('title must be between 1 and 200 characters'),
    body('content')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('content cannot be empty'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('tags must be an array'),
    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('each tag must be between 1 and 30 characters'),
];

// validation rules for sharing a note
exports.shareNoteValidation = [
    body('userIds')
        .isArray({ min: 1 })
        .withMessage('userIds must be a non-empty array'),
    body('userIds.*')
        .isMongoId()
        .withMessage('each userId must be a valid mongo id'),
];
