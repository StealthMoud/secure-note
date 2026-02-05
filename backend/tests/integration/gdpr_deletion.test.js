const request = require('supertest');
const mongoose = require('mongoose');
const connectDB = require('../../src/config/db');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Note = require('../../src/models/Note');
const SecurityLog = require('../../src/models/SecurityLog');

describe('GDPR Account Deletion Integration Tests', () => {
    let token;
    let userId;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await connectDB();
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Note.deleteMany({});
        await SecurityLog.deleteMany({});

        // 1. Create a user
        const userData = {
            username: 'gdprtest',
            email: 'gdpr@example.com',
            password: 'Password123!'
        };
        const userRes = await request(app).post('/api/auth/register').send(userData);
        userId = userRes.body.user._id;

        // 2. Auto-verify so they can create notes
        await User.findByIdAndUpdate(userId, { verified: true });

        // 3. Login to get token
        const loginRes = await request(app).post('/api/auth/login').send({
            identifier: userData.email,
            password: userData.password
        });
        token = loginRes.body.token;

        // 4. Create a note
        await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Private Note', content: 'Secret Data' });
    });

    test('should delete user and all associated notes', async () => {
        // Verify note exists
        const notesBefore = await Note.find({ owner: userId });
        expect(notesBefore.length).toBe(1);

        // Perform self-deletion
        const res = await request(app)
            .delete('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ password: 'Password123!' });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('deleted successfully');

        // Verify user is gone
        const userAfter = await User.findById(userId);
        expect(userAfter).toBeNull();

        // Verify notes are gone
        const notesAfter = await Note.find({ owner: userId });
        expect(notesAfter.length).toBe(0);

        // Verify logs are anonymized (user set to null)
        const logs = await SecurityLog.find({ user: userId });
        expect(logs.length).toBe(0);

        const anonymizedLogs = await SecurityLog.find({ 'details.anonymized': true });
        expect(anonymizedLogs.length).toBeGreaterThan(0);
    });

    test('should reject deletion with incorrect password', async () => {
        const res = await request(app)
            .delete('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ password: 'WrongPassword123' });

        expect(res.status).toBe(401);

        const userStillExists = await User.findById(userId);
        expect(userStillExists).not.toBeNull();
    });
});
