const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const requireVerified = require('../middleware/verification');
const { validateRequest } = require('../middleware/validationMiddleware');
const { shareNoteValidation, unshareNoteValidation } = require('../validators/noteValidator');
const { shareNote, unshareNote, getNotes } = require('../controllers/noteController');

// all sharing routes requir authentcation and email verificaton
router.use(authenticate);
router.use(requireVerified);

// share a note with a friend
router.post('/share', shareNoteValidation, validateRequest, (req, res) => {
    // map for controller compatibility
    req.body.target = req.body.target;
    return shareNote(req, res);
});

// Remove a Shared User
router.delete('/share/:noteId/:userId', (req, res) => {
    req.body.noteId = req.params.noteId;
    req.body.targetUserId = req.params.userId;
    return unshareNote(req, res);
});

// Get Notes Shared With Me
router.get('/shared-with-me', getNotes);

module.exports = router;