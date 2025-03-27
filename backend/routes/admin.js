const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const {
    getUsers,
    verifyUser,
    deactivateUser,
    deleteUser,
    getSecurityLogs,
    getStats,
    getNotes,
    deleteNote,
    createUser, // New
    unverifyUser, // New
    getUserActivity, // New
} = require('../controllers/adminController');

router.use(authenticate);
router.use(authorizeAdmin);

router.get('/users', getUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/unverify', unverifyUser); // New
router.put('/users/:id/deactivate', deactivateUser);
router.delete('/users/:id', deleteUser);
router.post('/users', createUser); // New
router.get('/users/:id/activity', getUserActivity); // New
router.get('/logs', getSecurityLogs);
router.get('/stats', getStats);
router.get('/notes', getNotes);
router.delete('/notes/:id', deleteNote);

module.exports = router;