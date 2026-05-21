import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Malware } from '../src/contexts/cyber/domain/entities/malware.entity';
import { MalwareMongooseRepository } from '../src/contexts/cyber/infrastructure/persistence/repositories/malware-mongoose.repository';
import { Report } from '../src/contexts/reporting/domain/entities/report.entity';
import { ReportType } from '../src/contexts/reporting/domain/value-objects/report-type.vo';
import { ReportMongooseRepository } from '../src/contexts/reporting/infrastructure/persistence/repositories/report-mongoose.repository';
import { Relationship } from '../src/contexts/shared/domain/entities/relationship.entity';
import { RelationshipType } from '../src/contexts/shared/domain/value-objects/relationship-type.vo';
import { RelationshipMongooseRepository } from '../src/contexts/shared/infrastructure/persistence/repositories/relationship-mongoose.repository';
import { ThreatActor } from '../src/contexts/threat/domain/entities/threat-actor.entity';
import { TLP } from '../src/contexts/threat/domain/value-objects';
import { ThreatActorMongooseRepository } from '../src/contexts/threat/infrastructure/persistence/repositories/threat-actor-mongoose.repository';

describe('Reports API (e2e)', () => {
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

        const reportRepository = app.get(ReportMongooseRepository);
        const threatActorRepository = app.get(ThreatActorMongooseRepository);
        const malwareRepository = app.get(MalwareMongooseRepository);
        const relationshipRepository = app.get(RelationshipMongooseRepository);

        await threatActorRepository.save(
            new ThreatActor({
                id: 'threat-actor--rep-actor-1',
                name: 'Phantom Bear',
                tlp: TLP.GREEN,
            }),
        );

        await malwareRepository.save(
            new Malware({
                id: 'malware--rep-malware-1',
                name: 'PhantomStealer',
                malwareTypes: [],
                isFamily: false,
            }),
        );

        await relationshipRepository.save(
            new Relationship({
                id: 'relationship--rep-r1',
                relationshipType: RelationshipType.USES,
                sourceRef: 'threat-actor--rep-actor-1',
                targetRef: 'malware--rep-malware-1',
            }),
        );

        // Report with full props including objectRefs pointing to saved entities
        await reportRepository.save(
            new Report({
                id: 'report--rep-e2e-1',
                name: 'Phantom Bear Threat Report',
                description:
                    'Comprehensive analysis of Phantom Bear operations and tooling.',
                reportTypes: [ReportType.THREAT_REPORT, ReportType.MALWARE],
                published: new Date('2024-03-01T10:00:00Z'),
                objectRefs: [
                    'threat-actor--rep-actor-1',
                    'malware--rep-malware-1',
                ],
                confidence: 90,
                externalReferences: [
                    { sourceName: 'MITRE ATT&CK', externalId: 'G0025' },
                ],
                tlp: TLP.GREEN,
            }),
        );

        // Second report for list/pagination tests
        await reportRepository.save(
            new Report({
                id: 'report--rep-e2e-2',
                name: 'Annual Threat Landscape 2024',
                description: 'Yearly summary of threat intelligence findings.',
                reportTypes: [ReportType.THREAT_REPORT],
                published: new Date('2024-12-31T23:59:59Z'),
                objectRefs: [],
                confidence: 75,
                tlp: TLP.AMBER,
            }),
        );
    });

    afterAll(async () => {
        await app.close();
        await mongod.stop();
    });

    it('GET /reports should return paginated catalog', () => {
        return request(app.getHttpServer())
            .get('/reports?page=1&limit=10')
            .expect(200)
            .expect((res) => {
                expect(res.body.meta).toMatchObject({
                    page: 1,
                    limit: 10,
                    total: 2,
                    totalPages: 1,
                });
                expect(res.body.data).toHaveLength(2);
            });
    });

    it('GET /reports should support sorting by published date ASC', () => {
        return request(app.getHttpServer())
            .get('/reports?sortBy=published&sortOrder=asc')
            .expect(200)
            .expect((res) => {
                expect(res.body.data[0]?.id).toBe('report--rep-e2e-1');
                expect(res.body.data[1]?.id).toBe('report--rep-e2e-2');
            });
    });

    it('GET /reports should filter by name', () => {
        return request(app.getHttpServer())
            .get('/reports?name=Phantom')
            .expect(200)
            .expect((res) => {
                expect(res.body.meta.total).toBe(1);
                expect(res.body.data[0]?.name).toContain('Phantom');
            });
    });

    it('GET /reports should filter by TLP', () => {
        return request(app.getHttpServer())
            .get('/reports?tlp=amber')
            .expect(200)
            .expect((res) => {
                expect(res.body.meta.total).toBe(1);
                expect(res.body.data[0]?.tlp).toBe(TLP.AMBER);
            });
    });

    it('GET /reports should validate invalid sort field', () => {
        return request(app.getHttpServer())
            .get('/reports?sortBy=invalid')
            .expect(400);
    });

    it('GET /reports should validate invalid sort order', () => {
        return request(app.getHttpServer())
            .get('/reports?sortOrder=invalid')
            .expect(400);
    });

    it('GET /reports should validate pagination bounds', async () => {
        await request(app.getHttpServer()).get('/reports?page=0').expect(400);
        await request(app.getHttpServer())
            .get('/reports?limit=101')
            .expect(400);
    });

    it('GET /reports/:id should return enriched report detail', () => {
        return request(app.getHttpServer())
            .get('/reports/report--rep-e2e-1')
            .expect(200)
            .expect((res) => {
                expect(res.body.entity).toHaveProperty(
                    'id',
                    'report--rep-e2e-1',
                );
                expect(res.body.entity).toHaveProperty(
                    'name',
                    'Phantom Bear Threat Report',
                );
                expect(res.body.relatedObjects).toBeDefined();
                expect(res.body.sightings).toBeDefined();
            });
    });

    it('GET /reports/:id should resolve objectRefs to domain entities', () => {
        return request(app.getHttpServer())
            .get('/reports/report--rep-e2e-1')
            .expect(200)
            .expect((res) => {
                const { objectRefs } = res.body as {
                    objectRefs: { id: string }[];
                };
                expect(objectRefs).toHaveLength(2);
                const ids = objectRefs.map((o) => o.id);
                expect(ids).toContain('threat-actor--rep-actor-1');
                expect(ids).toContain('malware--rep-malware-1');
            });
    });

    it('GET /reports/:id should return 404 when report does not exist', () => {
        return request(app.getHttpServer())
            .get('/reports/report--non-existent')
            .expect(404);
    });
});
