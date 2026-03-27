import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AttackPattern } from '../src/contexts/threat/domain/entities/attack-pattern.entity';
import { Campaign } from '../src/contexts/threat/domain/entities/campaign.entity';
import { Incident } from '../src/contexts/threat/domain/entities/incident.entity';
import { Indicator } from '../src/contexts/threat/domain/entities/indicator.entity';
import { ThreatActor } from '../src/contexts/threat/domain/entities/threat-actor.entity';
import { IocType, TLP } from '../src/contexts/threat/domain/value-objects';
import { AttackPatternMongooseRepository } from '../src/contexts/threat/infrastructure/persistence/repositories/attack-pattern-mongoose.repository';
import { CampaignMongooseRepository } from '../src/contexts/threat/infrastructure/persistence/repositories/campaign-mongoose.repository';
import { IncidentMongooseRepository } from '../src/contexts/threat/infrastructure/persistence/repositories/incident-mongoose.repository';
import { IndicatorMongooseRepository } from '../src/contexts/threat/infrastructure/persistence/repositories/indicator-mongoose.repository';
import { ThreatActorMongooseRepository } from '../src/contexts/threat/infrastructure/persistence/repositories/threat-actor-mongoose.repository';

describe('Threat API (e2e)', () => {
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

        const threatActorRepository = app.get(ThreatActorMongooseRepository);
        const campaignRepository = app.get(CampaignMongooseRepository);
        const incidentRepository = app.get(IncidentMongooseRepository);
        const attackPatternRepository = app.get(
            AttackPatternMongooseRepository,
        );
        const indicatorRepository = app.get(IndicatorMongooseRepository);

        await threatActorRepository.create(
            new ThreatActor({
                id: 'actor-b',
                name: 'Bravo Actor',
                tlp: TLP.GREEN,
            }),
        );
        await threatActorRepository.create(
            new ThreatActor({
                id: 'actor-a',
                name: 'Alpha Actor',
                tlp: TLP.AMBER,
            }),
        );
        await campaignRepository.create(
            new Campaign({
                id: 'camp-1',
                name: 'Campaign One',
                tlp: TLP.GREEN,
            }),
        );
        await incidentRepository.create(
            new Incident({ id: 'inc-1', name: 'Incident One', tlp: TLP.RED }),
        );
        await attackPatternRepository.create(
            new AttackPattern({
                id: 'ap-1',
                name: 'Attack Pattern One',
                tlp: TLP.WHITE,
            }),
        );
        await indicatorRepository.create(
            new Indicator({
                id: 'ind-1',
                type: IocType.DOMAIN,
                value: 'zzz.example',
                tlp: TLP.GREEN,
            }),
        );
        await indicatorRepository.create(
            new Indicator({
                id: 'ind-2',
                type: IocType.IPV4,
                value: '1.1.1.1',
                tlp: TLP.GREEN,
            }),
        );
    });

    afterAll(async () => {
        await app.close();
        await mongod.stop();
    });

    it('GET /threat-actors should return paginated catalog with sorting', () => {
        return request(app.getHttpServer())
            .get('/threat-actors?sortBy=name&sortOrder=asc&limit=10&page=1')
            .expect(200)
            .expect((res) => {
                expect(res.body.meta).toMatchObject({
                    page: 1,
                    limit: 10,
                    total: 2,
                    totalPages: 1,
                });
                expect(res.body.data[0]?.name).toBe('Alpha Actor');
                expect(res.body.data[1]?.name).toBe('Bravo Actor');
            });
    });

    it('GET /threat-actors/:id should return detail', () => {
        return request(app.getHttpServer())
            .get('/threat-actors/actor-a')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('id', 'actor-a');
                expect(res.body).toHaveProperty('name', 'Alpha Actor');
            });
    });

    it('GET /threat-actors/:id should return 404 when entity does not exist', () => {
        return request(app.getHttpServer())
            .get('/threat-actors/missing')
            .expect(404);
    });

    it('GET /campaigns should return catalog data', () => {
        return request(app.getHttpServer())
            .get('/campaigns')
            .expect(200)
            .expect((res) => {
                expect(res.body.meta.total).toBe(1);
                expect(res.body.data[0]?.id).toBe('camp-1');
            });
    });

    it('GET /incidents should validate invalid sort field', () => {
        return request(app.getHttpServer())
            .get('/incidents?sortBy=invalid')
            .expect(400);
    });

    it('GET /attack-patterns/:id should return detail', () => {
        return request(app.getHttpServer())
            .get('/attack-patterns/ap-1')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('id', 'ap-1');
            });
    });

    it('GET /indicators should return paginated catalog with sorting', () => {
        return request(app.getHttpServer())
            .get('/indicators?sortBy=value&sortOrder=asc')
            .expect(200)
            .expect((res) => {
                expect(res.body.meta.total).toBe(2);
                expect(res.body.data[0]?.value).toBe('1.1.1.1');
                expect(res.body.data[1]?.value).toBe('zzz.example');
            });
    });

    it('GET /indicators/:id should return detail', () => {
        return request(app.getHttpServer())
            .get('/indicators/ind-1')
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('id', 'ind-1');
                expect(res.body).toHaveProperty('value', 'zzz.example');
            });
    });

    it('GET /indicators/:id should return 404 when entity does not exist', () => {
        return request(app.getHttpServer())
            .get('/indicators/missing')
            .expect(404);
    });
});
