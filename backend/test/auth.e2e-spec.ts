import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Auth API (e2e)', () => {
    let app: INestApplication<App>;
    let mongod: MongoMemoryServer;

    const testUser = {
        email: 'auth-e2e@cti-platform.test',
        password: 'AuthE2ePass123!',
        name: 'Auth E2E User',
    };

    const extractAuthCookie = (setCookie?: string | string[]) => {
        const cookies =
            typeof setCookie === 'string' ? [setCookie] : (setCookie ?? []);

        return cookies.find((cookie) => cookie.startsWith('auth_token='));
    };

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();

        // eslint-disable-next-line @typescript-eslint/dot-notation
        process.env['MONGODB_URI'] = mongod.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
            }),
        );
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await mongod.stop();
    });

    it('POST /auth/register should create a user and return token + cookie', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send(testUser)
            .expect(201);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body.user).toMatchObject({
            email: testUser.email,
            name: testUser.name,
        });
        expect(response.body.user.id).toMatch(/^user--/);

        const authCookie = extractAuthCookie(response.headers['set-cookie']);
        expect(authCookie).toBeDefined();
    });

    it('POST /auth/register should reject duplicate email', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send(testUser)
            .expect(409);
    });

    it('POST /auth/register should validate payload', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: 'invalid-email', password: 'short', name: '' })
            .expect(400);
    });

    it('POST /auth/login should return token + cookie for valid credentials', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body.user).toMatchObject({
            email: testUser.email,
            name: testUser.name,
        });

        const authCookie = extractAuthCookie(response.headers['set-cookie']);
        expect(authCookie).toBeDefined();
    });

    it('POST /auth/login should reject invalid credentials', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: 'WrongPassword123!' })
            .expect(401);
    });

    it('POST /auth/login should reject malformed credentials', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'invalid-email', password: 'short' })
            .expect(401);
    });

    it('GET /auth/me should return 401 without auth', () => {
        return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('GET /auth/me should accept bearer token auth', async () => {
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200);

        const accessToken = loginResponse.body.accessToken as string;

        const meResponse = await request(app.getHttpServer())
            .get('/auth/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(meResponse.body).toMatchObject({
            email: testUser.email,
            name: testUser.name,
        });
    });

    it('GET /auth/me should accept auth cookie', async () => {
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200);

        const authCookie = extractAuthCookie(
            loginResponse.headers['set-cookie'],
        );
        expect(authCookie).toBeDefined();

        if (!authCookie) {
            throw new Error('auth_token cookie is missing in login response');
        }

        const authCookiePair = authCookie.split(';')[0];

        const meResponse = await request(app.getHttpServer())
            .get('/auth/me')
            .set('Cookie', authCookiePair)
            .expect(200);

        expect(meResponse.body).toMatchObject({
            email: testUser.email,
            name: testUser.name,
        });
    });

    it('POST /auth/logout should clear auth cookie', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/logout')
            .expect(200);

        expect(response.body).toEqual({ ok: true });

        const clearedCookie = extractAuthCookie(response.headers['set-cookie']);
        expect(clearedCookie).toBeDefined();
        expect(clearedCookie).toContain('auth_token=;');
    });
});
