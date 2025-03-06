// tests/export.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/app');

const mongoTestURI = 'mongodb://localhost:27017/secure-note-test-export';
let token;
let noteId;

beforeAll(async () => {
    await mongoose.connect(mongoTestURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Register and log in a test user for export tests
    const testUser = {
        username: 'exportuser',
        email: 'export@example.com',
        password: 'password123',
        confirmPassword: 'password123',
    };
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: testUser.email, password: testUser.password });
    token = res.body.token;

    // Create a note for export testing
    const noteRes = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Export Note',
            content: 'This is a note for export testing.',
            format: 'plain'
        });
    noteId = noteRes.body._id;
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe('Export Endpoints', () => {
    it('should export note as markdown', async () => {
        const res = await request(app)
            .get(`/api/export/${noteId}?format=markdown`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.headers['content-type']).toMatch(/text\/markdown/);
        expect(res.text).toContain('Export Note');
    });

    it('should export note as pdf', async () => {
        const res = await request(app)
            .get(`/api/export/${noteId}?format=pdf`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.headers['content-type']).toMatch(/application\/pdf/);
    });
});
