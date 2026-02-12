const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/uploadMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
    getCurrentUser,
    sendFriendRequest,
    respondToFriendRequest,
    getFriends,
    getActiveBroadcast,
    getBroadcastFeed,
    updateUsername,
    updateProfile,
    updatePersonalization,
    updateEmail,
    updatePassword,
    deleteSelfAccount
} = require('../controllers/userController');
const {
    updateProfileValidation,
    updateUsernameValidation,
    updateEmailValidation,
    updatePasswordValidation,
    updatePersonalizationValidation
} = require('../validators/userValidator');

// user management routes

router.get('/me', authenticate, getCurrentUser);

router.put('/update-username', authenticate, updateUsernameValidation, validateRequest, updateUsername);

router.put('/update-profile', authenticate, avatarUpload.single('avatar'), updateProfileValidation, validateRequest, updateProfile);

router.put('/personalization', authenticate, avatarUpload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'header', maxCount: 1 }]), updatePersonalizationValidation, validateRequest, updatePersonalization);

router.put('/email', authenticate, updateEmailValidation, validateRequest, updateEmail);

router.put('/password', authenticate, updatePasswordValidation, validateRequest, updatePassword);

router.delete('/me', authenticate, deleteSelfAccount);

//  friend management routes

router.get('/friends', authenticate, getFriends);

router.post('/friend/request', authenticate, (req, res) => {
    // simplified route as validator is already checkin this in body
    return sendFriendRequest(req, res);
});

router.post('/friend/respond', authenticate, respondToFriendRequest);

// broadcast routes

router.get('/broadcast', authenticate, getActiveBroadcast);
router.get('/broadcast/feed', authenticate, getBroadcastFeed);

module.exports = router;