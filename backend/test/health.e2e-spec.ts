import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Health (e2e)', () => {
    let app: INestApplication<App>;
    let mongod: MongoMemoryServer;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();

        // eslint-disable-next-line @typescript-eslint/dot-notation
        process.env['MONGODB_URI'] = mongod.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
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

    it('/health (GET) should return status ok', () => {
        return request(app.getHttpServer())
            .get('/health')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('status', 'ok');
                expect(res.body).toHaveProperty('timestamp');
                expect(res.body).toHaveProperty('database.status', 'up');
                expect(res.body).toHaveProperty('counts');
                expect(res.body).toHaveProperty('counts.threatActors');
                expect(res.body).toHaveProperty('counts.campaigns');
                expect(res.body).toHaveProperty('counts.incidents');
                expect(res.body).toHaveProperty('counts.attackPatterns');
                expect(res.body).toHaveProperty('counts.iocs');
                expect(res.body).toHaveProperty('lastIngestion', null);
            });
    });
});
