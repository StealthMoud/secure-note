const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { noteUpload } = require('../middleware/uploadMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
    createNoteValidation,
    updateNoteValidation,
} = require('../validators/noteValidator');
const {
    createNote,
    getNotes,
    updateNote,
    deleteNote,
    getTrash,
    restoreNote,
    permanentlyDeleteNote
} = require('../controllers/noteController');

router.use(authenticate);

// Note Management
router.get('/', getNotes);
router.post('/', noteUpload.array('images', 5), createNoteValidation, validateRequest, createNote);
router.put('/:noteId', noteUpload.array('images', 5), updateNoteValidation, validateRequest, updateNote);
router.delete('/:noteId', deleteNote);

// Trash Management
router.get('/trash/all', getTrash);
router.post('/:noteId/restore', restoreNote);
router.delete('/:noteId/permanent', permanentlyDeleteNote);

module.exports = router;