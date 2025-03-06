// tests/sharing.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/app');
const User = require('../backend/models/User');

const mongoTestURI = 'mongodb://localhost:27017/secure-note-test-sharing';
let ownerToken, recipientToken, noteId;

beforeAll(async () => {
    await mongoose.connect(mongoTestURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Create owner user
    const ownerUser = {
        username: 'owner',
        email: 'owner@example.com',
        password: 'password123',
        confirmPassword: 'password123',
    };
    await request(app).post('/api/auth/register').send(ownerUser);
    const ownerRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: ownerUser.email, password: ownerUser.password });
    ownerToken = ownerRes.body.token;

    // Create recipient user
    const recipientUser = {
        username: 'recipient',
        email: 'recipient@example.com',
        password: 'password123',
        confirmPassword: 'password123',
    };
    await request(app).post('/api/auth/register').send(recipientUser);
    const recipientRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: recipientUser.email, password: recipientUser.password });
    recipientToken = recipientRes.body.token;

    // Owner creates a note
    const noteRes = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'Shared Note', content: 'This note will be shared.', format: 'plain' });
    noteId = noteRes.body._id;
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe('Sharing Endpoints', () => {
    it('should share a note with a recipient', async () => {
        const res = await request(app)
            .post('/api/sharing/share')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({
                noteId,
                recipientEmail: 'recipient@example.com',
                permission: 'viewer'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Note shared successfully');
    });

    it('should get notes shared with me for recipient', async () => {
        const res = await request(app)
            .get('/api/sharing/shared-with-me')
            .set('Authorization', `Bearer ${recipientToken}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        const sharedNote = res.body.find(n => n._id === noteId);
        expect(sharedNote).toBeDefined();
    });

    it('should update sharing permission', async () => {
        const recipient = await User.findOne({ email: 'recipient@example.com' });
        const res = await request(app)
            .put(`/api/sharing/share/${noteId}/${recipient._id}`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ permission: 'editor' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Sharing permissions updated');
    });

    it('should remove shared user', async () => {
        const recipient = await User.findOne({ email: 'recipient@example.com' });
        const res = await request(app)
            .delete(`/api/sharing/share/${noteId}/${recipient._id}`)
            .set('Authorization', `Bearer ${ownerToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Shared user removed successfully');
    });
});
