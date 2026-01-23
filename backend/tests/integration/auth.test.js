const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Auth Integration Tests', () => {
    beforeAll(async () => {
        // use a test database if possible, or just be careful
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
    });

    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
    };

    test('POST /api/auth/register - success', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Registration successful');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toBe(testUser.username);
    });

    test('POST /api/auth/login - success', async () => {
        // first register
        await request(app).post('/api/auth/register').send(testUser);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toBe(testUser.email);
    });

    test('POST /api/auth/login - wrong password', async () => {
        await request(app).post('/api/auth/register').send(testUser);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error');
    });
});
