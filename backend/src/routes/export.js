const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validationMiddleware');
const { exportNoteValidation } = require('../validators/noteValidator');
const { exportNote } = require('../controllers/exportController');

// restrict note export to authenticated users
router.use(authenticate);

// export a note in various formats
router.get('/:noteId', exportNoteValidation, validateRequest, exportNote);

module.exports = router;