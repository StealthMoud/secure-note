// tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// Use a separate MongoDB URI for testing
const mongoTestURI = 'mongodb://localhost:27017/secure-note-test';

beforeAll(async () => {
    await mongoose.connect(mongoTestURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    // Clean up database and disconnect after tests finish.
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe('Auth Endpoints', () => {
    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
    };

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toEqual('User registered successfully');
    });

    it('should not register a duplicate user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBeDefined();
    });

    it('should login the registered user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ identifier: testUser.email, password: testUser.password });
        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
    });
});
