import { ReportType } from '../../../../../../src/contexts/reporting/domain/value-objects/report-type.vo';

describe('ReportType', () => {
    const values = Object.values(ReportType);

    it('should have exactly 11 values', () => {
        expect(values).toHaveLength(11);
    });

    it('should have all expected STIX report type values', () => {
        expect(ReportType.THREAT_REPORT).toBe('threat-report');
        expect(ReportType.ATTACK_PATTERN).toBe('attack-pattern');
        expect(ReportType.CAMPAIGN).toBe('campaign');
        expect(ReportType.IDENTITY).toBe('identity');
        expect(ReportType.INDICATOR).toBe('indicator');
        expect(ReportType.INTRUSION_SET).toBe('intrusion-set');
        expect(ReportType.MALWARE).toBe('malware');
        expect(ReportType.OBSERVED_DATA).toBe('observed-data');
        expect(ReportType.THREAT_ACTOR).toBe('threat-actor');
        expect(ReportType.TOOL).toBe('tool');
        expect(ReportType.VULNERABILITY).toBe('vulnerability');
    });

    it('should have all values as strings', () => {
        for (const value of values) {
            expect(typeof value).toBe('string');
        }
    });

    it('should have all unique values', () => {
        const unique = new Set(values);
        expect(unique.size).toBe(values.length);
    });

    it('should use kebab-case or lowercase format for all values', () => {
        for (const value of values) {
            expect(value).toMatch(/^[a-z][a-z0-9-]*$/);
        }
    });

    it('should be STIX 2.1 report_types vocabulary compliant', () => {
        const stixReportTypes = [
            'threat-report',
            'attack-pattern',
            'campaign',
            'identity',
            'indicator',
            'intrusion-set',
            'malware',
            'observed-data',
            'threat-actor',
            'tool',
            'vulnerability',
        ];
        for (const stixType of stixReportTypes) {
            expect(values).toContain(stixType);
        }
    });
});
