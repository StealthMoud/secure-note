const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// Create a Note
router.post('/', async (req, res) => {
    try {
        const newNote = new Note(req.body);
        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User's Notes
router.get('/', async (req, res) => {
    try {
        const notes = await Note.find({ owner: req.user.id });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;