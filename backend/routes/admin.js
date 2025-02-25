const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get All Users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify User
// for we keep this rout and lets see later what i will do with this, bacuase upon registeration we do not
// want to verify users.
router.put('/users/:id/verify', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;