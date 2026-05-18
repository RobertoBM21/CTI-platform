import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Report } from '../../../../../../../src/contexts/reporting/domain/entities/report.entity';
import { ReportType } from '../../../../../../../src/contexts/reporting/domain/value-objects/report-type.vo';
import { ReportMongooseRepository } from '../../../../../../../src/contexts/reporting/infrastructure/persistence/repositories/report-mongoose.repository';
import {
    ReportDocument,
    ReportSchema,
} from '../../../../../../../src/contexts/reporting/infrastructure/persistence/schemas';
import { TLP } from '../../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('ReportMongooseRepository integration', () => {
    let mongoServer: MongoMemoryServer;
    let testingModule: TestingModule;
    let reportRepository: ReportMongooseRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();

        testingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoServer.getUri()),
                MongooseModule.forFeature([
                    { name: ReportDocument.name, schema: ReportSchema },
                ]),
            ],
            providers: [ReportMongooseRepository],
        }).compile();

        reportRepository = testingModule.get(ReportMongooseRepository);
    });

    afterAll(async () => {
        await testingModule.close();
        await mongoServer.stop();
    });

    it('should persist and retrieve a Report by domain id', async () => {
        const published = new Date('2024-01-15T12:00:00Z');
        const report = new Report({
            id: 'report--rep-int-1',
            name: 'Integration Test Report',
            published,
            tlp: TLP.GREEN,
        });

        await reportRepository.save(report);
        const found = await reportRepository.findById('report--rep-int-1');

        expect(found).not.toBeNull();
        expect(found?.id).toBe('report--rep-int-1');
        expect(found?.name).toBe('Integration Test Report');
        expect(found?.tlp).toBe(TLP.GREEN);
        expect(found?.revoked).toBe(false);
    });

    it('should persist a Report with full props', async () => {
        const published = new Date('2024-06-01T09:00:00Z');
        const report = new Report({
            id: 'report--rep-int-2',
            name: 'Full Props Report',
            description: 'APT29 campaign analysis',
            reportTypes: [ReportType.THREAT_REPORT, ReportType.MALWARE],
            published,
            objectRefs: ['threat-actor--abc-123'],
            confidence: 85,
            revoked: false,
            externalReferences: [{ sourceName: 'MITRE', externalId: 'APT29' }],
            tlp: TLP.AMBER,
        });

        await reportRepository.save(report);
        const found = await reportRepository.findById('report--rep-int-2');

        expect(found?.id).toBe('report--rep-int-2');
        expect(found?.description).toBe('APT29 campaign analysis');
        expect(found?.reportTypes).toContain(ReportType.THREAT_REPORT);
        expect(found?.reportTypes).toContain(ReportType.MALWARE);
        expect(found?.confidence).toBe(85);
        expect(found?.objectRefs).toContain('threat-actor--abc-123');
        expect(found?.externalReferences).toEqual([
            { sourceName: 'MITRE', externalId: 'APT29' },
        ]);
        expect(found?.tlp).toBe(TLP.AMBER);
    });

    it('should return null when report does not exist', async () => {
        const found = await reportRepository.findById('report--non-existent');
        expect(found).toBeNull();
    });

    it('should list all persisted reports with pagination', async () => {
        const result = await reportRepository.findAll({}, 1, 50, {
            field: 'createdAt',
            direction: -1,
        });

        expect(result.data.length).toBeGreaterThanOrEqual(2);
        expect(result.meta.total).toBeGreaterThanOrEqual(2);
    });

    it('should filter reports by name', async () => {
        const result = await reportRepository.findAll(
            { name: 'Integration Test' },
            1,
            10,
            { field: 'createdAt', direction: -1 },
        );

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data[0]?.name).toContain('Integration Test');
    });

    it('should filter reports by TLP', async () => {
        const result = await reportRepository.findAll(
            { tlp: TLP.GREEN },
            1,
            10,
            { field: 'createdAt', direction: -1 },
        );

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.every((r) => r.tlp === TLP.GREEN)).toBe(true);
    });
});
