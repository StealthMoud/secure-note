// tests/notesEncryption.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/app');
const Note = require('../backend/models/Note');

const mongoTestURI = 'mongodb://localhost:27017/secure-note-test-encryption';
let token;
let encryptedNoteId;

beforeAll(async () => {
    await mongoose.connect(mongoTestURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Register and log in a test user for encryption tests
    const testUser = {
        username: 'encryptuser',
        email: 'encrypt@example.com',
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

describe('Encryption in Notes Endpoints', () => {
    it('should create a new encrypted note', async () => {
        const noteContent = 'This is a secret note.';
        const res = await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Encrypted Note',
                content: noteContent,
                encrypted: true,
                format: 'plain',
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.encrypted).toEqual(true);
        encryptedNoteId = res.body._id;

        // Optionally, check that the stored content is not plain text
        // (Assuming that encryption would change the text)
        expect(res.body.content).not.toEqual(noteContent);
    });

    it('should retrieve and decrypt the encrypted note', async () => {
        const res = await request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        // Find our encrypted note in the retrieved notes array
        const note = res.body.find(n => n._id === encryptedNoteId);
        expect(note).toBeDefined();
        // The decrypted content should match the original plain text
        expect(note.content).toEqual('This is a secret note.');
    });
});
