const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Note = require('../../src/models/Note');

describe('Notes Integration Tests', () => {
    let token;
    let userId;

    beforeAll(async () => {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/secure-note-test';
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(uri.replace('mongodb://mongodb:', 'mongodb://localhost:'));
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Note.deleteMany({});

        // Create a user and get token
        const userRes = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'notetester',
                email: 'notes@example.com',
                password: 'Password123!'
            });

        userId = userRes.body.user.id;

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'notes@example.com',
                password: 'Password123!'
            });

        token = loginRes.body.token;
    });

    test('POST /api/notes - create encrypted note', async () => {
        const res = await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Secret Note',
                content: 'This is a secret',
                isEncrypted: true
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.note.title).toBe('Secret Note');
        expect(res.body.note.owner).toBe(String(userId));
    });

    test('GET /api/notes - list user notes', async () => {
        // create a note first
        await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Note 1',
                content: 'Content 1'
            });

        const res = await request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].title).toBe('Note 1');
    });
});
