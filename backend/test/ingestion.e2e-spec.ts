import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Ingestion API (e2e)', () => {
    let app: INestApplication<App>;
    let mongod: MongoMemoryServer;

    const stixBundle = {
        type: 'bundle',
        id: 'bundle--601cee35-6b16-4e68-a3e7-9ec7d755b4c3',
        objects: [
            {
                type: 'threat-actor',
                spec_version: '2.1',
                id: 'threat-actor--dfaa8d77-07e2-4e28-b2c8-92e9f7b04428',
                created: '2014-11-19T23:39:03.893Z',
                modified: '2014-11-19T23:39:03.893Z',
                name: 'Disco Team Threat Actor Group',
                description:
                    'This organized threat actor group operates to create profit from all types of crime.',
                threat_actor_types: ['crime-syndicate'],
                aliases: ['Equipo del Discoteca'],
                roles: ['agent'],
                goals: 'Steal Credit Card Information',
                sophistication: 'expert',
                resource_level: 'organization',
                primary_motivation: 'personal-gain',
            },
            {
                type: 'identity',
                spec_version: '2.1',
                id: 'identity--733c5838-34d9-4fbf-949c-62aba761184c',
                created: '2016-08-23T18:05:49.307Z',
                modified: '2016-08-23T18:05:49.307Z',
                name: 'Disco Team',
                description:
                    'Disco Team is the name of an organized threat actor crime-syndicate.',
                identity_class: 'organization',
                contact_information: 'disco-team@stealthemail.com',
            },
            {
                type: 'relationship',
                spec_version: '2.1',
                id: 'relationship--a2e3efb5-351d-4d46-97a0-6897ee7c77a0',
                created: '2020-02-29T18:01:28.577Z',
                modified: '2020-02-29T18:01:28.577Z',
                relationship_type: 'attributed-to',
                source_ref:
                    'threat-actor--dfaa8d77-07e2-4e28-b2c8-92e9f7b04428',
                target_ref: 'identity--733c5838-34d9-4fbf-949c-62aba761184c',
            },
        ],
    };

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

    it('POST /ingestion/bundles should ingest a STIX bundle', async () => {
        const response = await request(app.getHttpServer())
            .post('/ingestion/bundles')
            .send(stixBundle)
            .expect(201);

        expect(response.body).toEqual({
            total: 3,
            processed: 3,
            skipped: 0,
            failed: 0,
        });
    });

    it('should be idempotent — ingesting same bundle twice produces no duplicates', async () => {
        const response = await request(app.getHttpServer())
            .post('/ingestion/bundles')
            .send(stixBundle)
            .expect(201);

        expect(response.body).toEqual({
            total: 3,
            processed: 3,
            skipped: 0,
            failed: 0,
        });
    });

    it('should make ingested threat-actor retrievable via GET', async () => {
        const response = await request(app.getHttpServer())
            .get(
                '/threat-actors/threat-actor--dfaa8d77-07e2-4e28-b2c8-92e9f7b04428',
            )
            .expect(200);

        expect(response.body.entity.name).toBe('Disco Team Threat Actor Group');
        expect(response.body.entity.createdAt).toBe('2014-11-19T23:39:03.893Z');
    });

    it('should preserve the original STIX created date on re-ingestion', async () => {
        const modifiedBundle = {
            ...stixBundle,
            objects: [
                {
                    ...stixBundle.objects[0],
                    modified: '2025-01-01T00:00:00.000Z',
                    description: 'Updated description',
                },
            ],
        };

        await request(app.getHttpServer())
            .post('/ingestion/bundles')
            .send(modifiedBundle)
            .expect(201);

        const response = await request(app.getHttpServer())
            .get(
                '/threat-actors/threat-actor--dfaa8d77-07e2-4e28-b2c8-92e9f7b04428',
            )
            .expect(200);

        expect(response.body.entity.createdAt).toBe('2014-11-19T23:39:03.893Z');
        expect(response.body.entity.description).toBe('Updated description');
    });

    it('should enrich threat-actor detail with relationships', async () => {
        const response = await request(app.getHttpServer())
            .get(
                '/threat-actors/threat-actor--dfaa8d77-07e2-4e28-b2c8-92e9f7b04428',
            )
            .expect(200);

        expect(response.body.relatedObjects.length).toBeGreaterThanOrEqual(1);
        const related = response.body.relatedObjects[0];
        expect(related.relationship.relationshipType).toBe('attributed-to');
        expect(related.object.name).toBe('Disco Team');
    });

    it('should skip unsupported types in the bundle', async () => {
        const bundleWithUnknown = {
            type: 'bundle',
            id: 'bundle--test',
            objects: [
                { type: 'marking-definition', id: 'md--1' },
                {
                    type: 'vulnerability',
                    id: 'vulnerability--test',
                    name: 'CVE-Test',
                    created: '2021-01-01T00:00:00.000Z',
                    modified: '2021-01-01T00:00:00.000Z',
                },
            ],
        };

        const response = await request(app.getHttpServer())
            .post('/ingestion/bundles')
            .send(bundleWithUnknown)
            .expect(201);

        expect(response.body).toEqual({
            total: 2,
            processed: 1,
            skipped: 1,
            failed: 0,
        });
    });

    it('should reject invalid bundles', async () => {
        await request(app.getHttpServer())
            .post('/ingestion/bundles')
            .send({ type: 'not-a-bundle', id: 'x', objects: [] })
            .expect(400);
    });
});
