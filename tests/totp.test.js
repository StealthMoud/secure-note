// tests/totp.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const speakeasy = require('speakeasy');
const app = require('../backend/app');

const mongoTestURI = 'mongodb://localhost:27017/secure-note-test-totp';
let token;
let totpSetupResponse;

beforeAll(async () => {
    await mongoose.connect(mongoTestURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Register and log in a test user for TOTP
    const testUser = {
        username: 'totpuser',
        email: 'totp@example.com',
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

describe('TOTP Endpoints', () => {
    it('should setup TOTP for the user', async () => {
        const res = await request(app)
            .get('/api/totp/setup')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.qrCodeDataURL).toBeDefined();
        expect(res.body.secret).toBeDefined();
        totpSetupResponse = res.body;
    });

    it('should verify TOTP token', async () => {
        // Generate a token using the secret returned from setup
        const generatedToken = speakeasy.totp({
            secret: totpSetupResponse.secret,
            encoding: 'base32'
        });

        const res = await request(app)
            .post('/api/totp/verify')
            .set('Authorization', `Bearer ${token}`)
            .send({ token: generatedToken });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('TOTP has been enabled successfully.');
    });
});
