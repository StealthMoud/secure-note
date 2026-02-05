const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const noteController = require('../../src/controllers/noteController');
const Note = require('../../src/models/Note');
const User = require('../../src/models/User');

// Mock dependencies
jest.mock('../../src/models/Note');
jest.mock('../../src/models/User');
jest.mock('../../src/utils/logger', () => ({
    logSecurityEvent: jest.fn(),
    logUserEvent: jest.fn()
}));
jest.mock('../../src/services/note/encryptionHelper', () => ({
    decryptNoteForUser: jest.fn().mockImplementation((note) => note),
    reEncryptNoteData: jest.fn().mockReturnValue('encrypted-data')
}));

// Create a simple express app for testing the controller directly
const app = express();
app.use(bodyParser.json());

// Mock Auth Middleware
app.use((req, res, next) => {
    req.user = { id: 'user123' };
    next();
});

app.put('/notes/:noteId', noteController.updateNote);

describe('NFR-1.4: Concurrency Control (Optimistic Locking)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mock for Note.findById chain
        const mockPopulate = jest.fn().mockReturnThis();
        Note.findById.mockReturnValue({
            populate: mockPopulate,
            toObject: jest.fn().mockImplementation(function () {
                return this.data || {
                    _id: 'note123',
                    owner: 'user123',
                    __v: 3,
                    encrypted: false,
                    title: 'Mock Title',
                    content: 'Mock Content',
                    format: 'plain'
                };
            })
        });
    });

    it('should REJECT concurrent update with stale version (409 Conflict)', async () => {
        console.log('\n   Scenario: User A and User B both fetch Note (version 2)');
        console.log('   User A updates successfully → version becomes 3');
        console.log('   User B tries to update with stale version 2...\n');

        // Setup: User exists and is verified
        User.findById.mockResolvedValue({ _id: 'user123', verified: true, privateKey: 'key' });

        // Setup: First findOne (with version) returns null, second one (just ID) returns note
        Note.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ _id: 'note123', owner: 'user123', __v: 5, sharedWith: [] });

        // Setup: findById should return note for population
        const mockPopulate = jest.fn().mockReturnThis();
        Note.findById.mockReturnValue({
            populate: mockPopulate,
            toObject: jest.fn().mockReturnValue({ _id: 'note123', owner: 'user123', __v: 5 })
        });

        const res = await request(app)
            .put('/notes/note123')
            .send({
                title: 'User B Edit',
                version: 2 // Stale version
            });

        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/modified by another user/);

        console.log('   RESULT: 409 Conflict returned');
        console.log('   Message:', res.body.error);
        console.log('   Data Consistency: PRESERVED\n');
    });

    it('should ACCEPT update when version matches (200 OK)', async () => {
        console.log('\n   Scenario: User updates note with correct version\n');

        // Setup: User exists
        User.findById.mockResolvedValue({ _id: 'user123', verified: true });

        // Setup: findOne returns note
        Note.findOne.mockResolvedValue({ _id: 'note123', owner: 'user123', __v: 2, sharedWith: [] });

        // Setup: Update succeeds
        const updatedNote = { _id: 'note123', title: 'Updated Title', __v: 3 };
        Note.findOneAndUpdate.mockResolvedValue(updatedNote);

        // Setup: Note.findById should return the updated version
        Note.findById.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            toObject: jest.fn().mockReturnValue({ ...updatedNote })
        });

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

        // Verify correct query was used
        expect(Note.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ _id: 'note123', __v: 2 }),
            expect.any(Object),
            expect.any(Object)
        );
    });

    it('should INCREMENT version number on successful update', async () => {
        console.log('\n   Scenario: Verifying version increment mechanism\n');

        User.findById.mockResolvedValue({ _id: 'user123', verified: true });

        // Setup: findOne returns note
        Note.findOne.mockResolvedValue({ _id: 'note123', owner: 'user123', __v: 9, sharedWith: [] });

        const updatedNote = { _id: 'note123', title: 'Test', __v: 10 };
        Note.findOneAndUpdate.mockResolvedValue(updatedNote);

        // Setup: Note.findById should return the updated version
        Note.findById.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            toObject: jest.fn().mockReturnValue({ ...updatedNote })
        });

        const res = await request(app)
            .put('/notes/note123')
            .send({ title: 'Test', version: 9 });

        expect(res.status).toBe(200);

        console.log('   Version Before: 9');
        console.log('   Version After:', res.body.note.__v);
        console.log('   Increment Applied: YES\n');

        // Verify $inc was called
        expect(Note.findOneAndUpdate).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({ $inc: { __v: 1 } }),
            expect.any(Object)
        );
    });
});
