const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const noteController = require('../../src/controllers/noteController');
const Note = require('../../src/models/Note');
const User = require('../../src/models/User');

// mock dependencies
jest.mock('../../src/models/Note');
jest.mock('../../src/models/User');
jest.mock('../../src/utils/logger', () => ({
    logSecurityEvent: jest.fn(),
    logUserEvent: jest.fn()
}));
jest.mock('../../src/utils/encryption', () => ({
    rsaEncrypt: jest.fn().mockReturnValue('mock-encrypted-key'),
    rsaDecrypt: jest.fn().mockReturnValue('mock-symmetric-key'),
    aesEncrypt: jest.fn().mockReturnValue('mock-iv:mock-tag:mock-data'),
    aesDecrypt: jest.fn().mockReturnValue(JSON.stringify({ title: 'Mock Title', content: 'Mock Content' })),
    generateSymmetricKey: jest.fn().mockReturnValue('mock-key')
}));

// create a simple express app for testing the controller directly
const app = express();
app.use(bodyParser.json());

// mock auth middleware
app.use((req, res, next) => {
    req.user = { id: 'user123' };
    next();
});

app.put('/notes/:noteId', noteController.updateNote);

// handle business errors (like conflict) for testing
app.use((err, req, res, next) => {
    if (err.message && err.message.includes('Conflict')) {
        return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
});

describe('NFR-1.4: Concurrency Control (Optimistic Locking)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // setup default mock for note.findById
        const mockNote = {
            _id: 'note123',
            owner: 'user123',
            __v: 2,
            encrypted: false,
            title: 'Mock Title',
            content: 'Mock Content',
            format: 'plain',
            sharedWith: [],
            populate: jest.fn().mockReturnThis(),
            toObject: jest.fn().mockReturnThis()
        };
        mockNote.toObject.mockReturnValue(mockNote);
        Note.findById.mockResolvedValue(mockNote);
    });

    it('should REJECT concurrent update with stale version (409 Conflict)', async () => {
        console.log('\n   Scenario: User A and User B both fetch Note (version 2)');
        console.log('   User A updates successfully → version becomes 3');
        console.log('   User B tries to update with stale version 2...\n');

        // setup: user exists and is verified
        User.findById.mockResolvedValue({ _id: 'user123', verified: true, privateKey: 'key' });

        // setup: findById returns the note at the START of the update (with version 5, mockin a clash)
        Note.findById.mockResolvedValue({
            _id: 'note123', owner: 'user123', __v: 5, sharedWith: [],
            populate: jest.fn().mockReturnThis(),
            toObject: jest.fn().mockReturnThis()
        });

        // setup: findOneAndUpdate returns null because version 2 doesn't match DB v5
        Note.findOneAndUpdate.mockResolvedValue(null);

        const res = await request(app)
            .put('/notes/note123')
            .send({
                title: 'User B Edit',
                version: 2 // Stale version (compared to DB v5)
            });

        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/modified by another user/);

        console.log('   RESULT: 409 Conflict returned');
        console.log('   Message:', res.body.error);
        console.log('   Data Consistency: PRESERVED\n');
    });

    it('should ACCEPT update when version matches (200 OK)', async () => {
        console.log('\n   Scenario: User updates note with correct version\n');

        // setup: user exists
        User.findById.mockResolvedValue({ _id: 'user123', verified: true, privateKey: 'key' });

        // setup: Note.findById returns the version at the START (v2)
        Note.findById.mockResolvedValue({
            _id: 'note123', owner: 'user123', __v: 2, sharedWith: [],
            populate: jest.fn().mockReturnThis(),
            toObject: jest.fn().mockReturnThis()
        });

        // setup: findOneAndUpdate returns the note with incremented version (v3)
        const updatedNote = { _id: 'note123', title: 'Updated Title', __v: 3 };
        Note.findOneAndUpdate.mockResolvedValue(updatedNote);

        const res = await request(app)
            .put('/notes/note123')
            .send({
                title: 'Updated Title',
                version: 2 // Correct version
            });

        expect(res.status).toBe(200);
        expect(res.body.note.__v).toBe(3);

        console.log('   RESULT: 200 OK');
        console.log('   New Version:', res.body.note.__v);
        console.log('   Optimistic Lock: SUCCESSFUL\n');

        // verify correct query was used
        expect(Note.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ _id: 'note123', __v: 2 }),
            expect.any(Object),
            expect.any(Object)
        );
    });

    it('should INCREMENT version number on successful update', async () => {
        console.log('\n   Scenario: Verifying version increment mechanism\n');

        User.findById.mockResolvedValue({ _id: 'user123', verified: true, privateKey: 'key' });

        // setup: Note.findById returns the version at the START (v9)
        Note.findById.mockResolvedValue({
            _id: 'note123', owner: 'user123', __v: 9, sharedWith: [],
            populate: jest.fn().mockReturnThis(),
            toObject: jest.fn().mockReturnThis()
        });

        // setup: findOneUpdate returns the note with incremented version (v10)
        const updatedNote = { _id: 'note123', title: 'Test', __v: 10 };
        Note.findOneAndUpdate.mockResolvedValue(updatedNote);

        const res = await request(app)
            .put('/notes/note123')
            .send({ title: 'Test', version: 9 });

        expect(res.status).toBe(200);

        console.log('   Version Before: 9');
        console.log('   Version After:', res.body.note.__v);
        console.log('   Increment Applied: YES\n');

        // verify $inc was called
        expect(Note.findOneAndUpdate).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({ $inc: { __v: 1 } }),
            expect.any(Object)
        );
    });
});
