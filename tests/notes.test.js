const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/app');
const User = require('../backend/models/User');
const Note = require('../backend/models/Note');

const mongoTestURI = 'mongodb://localhost:27017/secure-note-test';

let token;
let noteId;

beforeAll(async () => {
    await mongoose.connect(mongoTestURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Register and log in a test user
    const testUser = {
        username: 'notesuser',
        email: 'notes@example.com',
        password: 'password123',
        confirmPassword: 'password123',
    };

    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier: testUser.email, password: testUser.password });
    token = res.body.token;
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe('Notes Endpoints', () => {
    it('should create a new note', async () => {
        const res = await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Note',
                content: 'This is a test note.',
                format: 'markdown'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toEqual('Test Note');
        noteId = res.body._id;
    });

    it('should get notes for authenticated user', async () => {
        const res = await request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
});
