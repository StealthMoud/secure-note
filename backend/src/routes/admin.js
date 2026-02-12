const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const {
    getUsers,
    verifyUser,
    deleteUser,
    getSecurityLogs,
    getStats,
    getNoteStats,
    getNotes,
    deleteNote,
    createUser,
    unverifyUser,
    getUserActivity,
    bulkUserAction,
    sendBroadcast,
    getBroadcasts,
    updateUserRole,
} = require('../controllers/adminController');

// all routes requir admin authentcation
router.use(authenticate);
router.use(authorizeRole('admin'));

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/unverify', unverifyUser);
router.delete('/users/:id', deleteUser);
router.post('/users', createUser);
router.get('/users/:id/activity', getUserActivity);
router.get('/logs', getSecurityLogs);
router.get('/stats', getStats);
router.get('/notes', getNotes);
router.get('/note-stats', getNoteStats);
router.delete('/notes/:id', deleteNote);


// bulk action route for admins
router.post('/bulk-action', bulkUserAction);
router.post('/broadcast', sendBroadcast);
router.get('/broadcasts', getBroadcasts);

module.exports = router;
