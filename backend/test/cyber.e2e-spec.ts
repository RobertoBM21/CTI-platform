import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { IntrusionSet } from '../src/contexts/cyber/domain/entities/intrusion-set.entity';
import { Location } from '../src/contexts/cyber/domain/entities/location.entity';
import { Malware } from '../src/contexts/cyber/domain/entities/malware.entity';
import { Tool } from '../src/contexts/cyber/domain/entities/tool.entity';
import { Vulnerability } from '../src/contexts/cyber/domain/entities/vulnerability.entity';
import { IntrusionSetMongooseRepository } from '../src/contexts/cyber/infrastructure/persistence/repositories/intrusion-set-mongoose.repository';
import { LocationMongooseRepository } from '../src/contexts/cyber/infrastructure/persistence/repositories/location-mongoose.repository';
import { MalwareMongooseRepository } from '../src/contexts/cyber/infrastructure/persistence/repositories/malware-mongoose.repository';
import { ToolMongooseRepository } from '../src/contexts/cyber/infrastructure/persistence/repositories/tool-mongoose.repository';
import { VulnerabilityMongooseRepository } from '../src/contexts/cyber/infrastructure/persistence/repositories/vulnerability-mongoose.repository';
import { TLP } from '../src/contexts/shared/domain/value-objects/tlp.vo';

describe('Cyber API (e2e)', () => {
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

        const malwareRepository = app.get(MalwareMongooseRepository);
        const toolRepository = app.get(ToolMongooseRepository);
        const vulnerabilityRepository = app.get(
            VulnerabilityMongooseRepository,
        );
        const intrusionSetRepository = app.get(IntrusionSetMongooseRepository);
        const locationRepository = app.get(LocationMongooseRepository);

        await malwareRepository.save(
            new Malware({
                id: 'malware--cyber-e2e-1',
                name: 'Cyber E2E Malware',
                isFamily: true,
                tlp: TLP.AMBER,
            }),
        );

        await toolRepository.save(
            new Tool({
                id: 'tool--cyber-e2e-1',
                name: 'Cyber E2E Tool',
                tlp: TLP.GREEN,
            }),
        );

        await vulnerabilityRepository.save(
            new Vulnerability({
                id: 'vulnerability--cyber-e2e-1',
                name: 'CVE-2099-0001',
                description: 'Cyber E2E Vulnerability',
                tlp: TLP.RED,
            }),
        );

        await intrusionSetRepository.save(
            new IntrusionSet({
                id: 'intrusion-set--cyber-e2e-1',
                name: 'Cyber E2E Intrusion Set',
                tlp: TLP.WHITE,
            }),
        );

        await locationRepository.save(
            new Location({
                id: 'location--cyber-e2e-1',
                name: 'Bilbao Datacenter',
                country: 'ES',
                tlp: TLP.GREEN,
            }),
        );
    });

    afterAll(async () => {
        await app.close();
        await mongod.stop();
    });

    it('GET /malware should return paginated catalog', () => {
        return request(app.getHttpServer())
            .get('/malware?page=1&limit=10&sortBy=name&sortOrder=asc')
            .expect(200)
            .expect((res) => {
                expect(res.body.meta).toMatchObject({
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                });
                expect(res.body.data[0]?.id).toBe('malware--cyber-e2e-1');
            });
    });

    it('GET /malware should validate invalid query values', () => {
        return request(app.getHttpServer())
            .get('/malware?sortBy=invalid&page=0')
            .expect(400);
    });

    it('GET /malware/:id should return enriched detail', () => {
        return request(app.getHttpServer())
            .get('/malware/malware--cyber-e2e-1')
            .expect(200)
            .expect((res) => {
                expect(res.body.entity).toHaveProperty(
                    'id',
                    'malware--cyber-e2e-1',
                );
                expect(res.body.relatedObjects).toBeDefined();
                expect(res.body.sightings).toBeDefined();
            });
    });

    it('GET /malware/:id should return 404 when missing', () => {
        return request(app.getHttpServer()).get('/malware/missing').expect(404);
    });

    it('GET /tools should return catalog and validate sort', async () => {
        await request(app.getHttpServer())
            .get('/tools?sortBy=name&sortOrder=asc')
            .expect(200)
            .expect((res) => {
                expect(res.body.meta.total).toBe(1);
                expect(res.body.data[0]?.id).toBe('tool--cyber-e2e-1');
            });

        await request(app.getHttpServer())
            .get('/tools?sortOrder=invalid')
            .expect(400);
    });

    it('GET /tools/:id should return detail and 404 when missing', async () => {
        await request(app.getHttpServer())
            .get('/tools/tool--cyber-e2e-1')
            .expect(200)
            .expect((res) => {
                expect(res.body.entity).toHaveProperty(
                    'id',
                    'tool--cyber-e2e-1',
                );
            });

        await request(app.getHttpServer()).get('/tools/missing').expect(404);
    });

    it('GET /vulnerabilities should return catalog and validate pagination', async () => {
        await request(app.getHttpServer())
            .get('/vulnerabilities?name=CVE')
            .expect(200)
            .expect((res) => {
                expect(res.body.meta.total).toBe(1);
                expect(res.body.data[0]?.id).toBe('vulnerability--cyber-e2e-1');
            });

        await request(app.getHttpServer())
            .get('/vulnerabilities?limit=101')
            .expect(400);
    });

    it('GET /vulnerabilities/:id should return detail and 404 when missing', async () => {
        await request(app.getHttpServer())
            .get('/vulnerabilities/vulnerability--cyber-e2e-1')
            .expect(200)
            .expect((res) => {
                expect(res.body.entity).toHaveProperty(
                    'id',
                    'vulnerability--cyber-e2e-1',
                );
            });

        await request(app.getHttpServer())
            .get('/vulnerabilities/missing')
            .expect(404);
    });

    it('GET /intrusion-sets should return catalog and validate sort', async () => {
        await request(app.getHttpServer())
            .get('/intrusion-sets')
            .expect(200)
            .expect((res) => {
                expect(res.body.meta.total).toBe(1);
                expect(res.body.data[0]?.id).toBe('intrusion-set--cyber-e2e-1');
            });

        await request(app.getHttpServer())
            .get('/intrusion-sets?sortBy=invalid')
            .expect(400);
    });

    it('GET /intrusion-sets/:id should return detail and 404 when missing', async () => {
        await request(app.getHttpServer())
            .get('/intrusion-sets/intrusion-set--cyber-e2e-1')
            .expect(200)
            .expect((res) => {
                expect(res.body.entity).toHaveProperty(
                    'id',
                    'intrusion-set--cyber-e2e-1',
                );
            });

        await request(app.getHttpServer())
            .get('/intrusion-sets/missing')
            .expect(404);
    });

    it('GET /locations should return catalog and validate query', async () => {
        await request(app.getHttpServer())
            .get('/locations?sortBy=name&sortOrder=asc')
            .expect(200)
            .expect((res) => {
                expect(res.body.meta.total).toBe(1);
                expect(res.body.data[0]?.id).toBe('location--cyber-e2e-1');
            });

        await request(app.getHttpServer()).get('/locations?page=0').expect(400);
    });
});
