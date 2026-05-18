import { Report } from '../../../../../../src/contexts/reporting/domain/entities/report.entity';
import { ReportType } from '../../../../../../src/contexts/reporting/domain/value-objects/report-type.vo';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('Report', () => {
    describe('constructor with minimal props', () => {
        it('should create a Report with name and published date', () => {
            const published = new Date('2024-06-01');
            const report = new Report({
                name: 'PHOSPHOR Unit Analysis',
                published,
            });
            expect(report.name).toBe('PHOSPHOR Unit Analysis');
            expect(report.published).toBe(published);
        });

        it('should generate an id with report-- prefix when not provided', () => {
            const report = new Report({
                name: 'Test Report',
                published: new Date(),
            });
            expect(report.id).toMatch(/^report--/);
        });

        it('should default TLP to WHITE', () => {
            const report = new Report({ name: 'Test', published: new Date() });
            expect(report.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const report = new Report({ name: 'Test', published: new Date() });
            expect(report.reportTypes).toEqual([]);
            expect(report.objectRefs).toEqual([]);
            expect(report.externalReferences).toEqual([]);
        });

        it('should default revoked to false', () => {
            const report = new Report({ name: 'Test', published: new Date() });
            expect(report.revoked).toBe(false);
        });

        it('should auto-generate createdAt and updatedAt', () => {
            const report = new Report({ name: 'Test', published: new Date() });
            expect(report.createdAt).toBeInstanceOf(Date);
            expect(report.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields', () => {
            const published = new Date('2024-06-01T12:00:00Z');
            const now = new Date();
            const report = new Report({
                id: 'report--test-id',
                name: 'APT29 Threat Report',
                description: 'Comprehensive analysis of APT29 operations',
                reportTypes: [ReportType.THREAT_REPORT, ReportType.MALWARE],
                published,
                objectRefs: [
                    'threat-actor--abc',
                    'malware--def',
                    'campaign--ghi',
                ],
                confidence: 85,
                revoked: false,
                externalReferences: [
                    { sourceName: 'MITRE', externalId: 'APT29' },
                ],
                tlp: TLP.AMBER,
                createdAt: now,
                updatedAt: now,
            });

            expect(report.id).toBe('report--test-id');
            expect(report.name).toBe('APT29 Threat Report');
            expect(report.description).toBe(
                'Comprehensive analysis of APT29 operations',
            );
            expect(report.reportTypes).toEqual([
                ReportType.THREAT_REPORT,
                ReportType.MALWARE,
            ]);
            expect(report.published).toBe(published);
            expect(report.objectRefs).toEqual([
                'threat-actor--abc',
                'malware--def',
                'campaign--ghi',
            ]);
            expect(report.confidence).toBe(85);
            expect(report.revoked).toBe(false);
            expect(report.externalReferences).toEqual([
                { sourceName: 'MITRE', externalId: 'APT29' },
            ]);
            expect(report.tlp).toBe(TLP.AMBER);
            expect(report.createdAt).toBe(now);
            expect(report.updatedAt).toBe(now);
        });
    });
});
