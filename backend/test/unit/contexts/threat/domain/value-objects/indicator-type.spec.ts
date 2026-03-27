import { IndicatorType } from '../../../../../../src/contexts/threat/domain/value-objects/indicator-type.vo';

describe('IndicatorType', () => {
    const values = Object.values(IndicatorType);

    it('should have exactly 7 values', () => {
        expect(values).toHaveLength(7);
    });

    it('should have all expected values from STIX indicator-type-ov', () => {
        expect(IndicatorType.ANOMALOUS_ACTIVITY).toBe('anomalous-activity');
        expect(IndicatorType.ANONYMIZATION).toBe('anonymization');
        expect(IndicatorType.BENIGN).toBe('benign');
        expect(IndicatorType.COMPROMISED).toBe('compromised');
        expect(IndicatorType.MALICIOUS_ACTIVITY).toBe('malicious-activity');
        expect(IndicatorType.ATTRIBUTION).toBe('attribution');
        expect(IndicatorType.UNKNOWN).toBe('unknown');
    });

    it('should have all values as kebab-case strings', () => {
        for (const value of values) {
            expect(typeof value).toBe('string');
            expect(value).toMatch(/^[a-z][a-z0-9-]*$/);
        }
    });

    it('should have all unique values', () => {
        const unique = new Set(values);
        expect(unique.size).toBe(values.length);
    });
});
