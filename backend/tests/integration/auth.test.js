const request = require('supertest');
const mongoose = require('mongoose');
const connectDB = require('../../src/config/db');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Auth Integration Tests', () => {
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
        expect(res.body).toHaveProperty('message', 'User registered successfully!');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toBe(testUser.username);
    });

    test('POST /api/auth/login - success', async () => {
        // first register
        await request(app).post('/api/auth/register').send(testUser);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                identifier: testUser.email,
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
                identifier: testUser.email,
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('errors');
    });
});
