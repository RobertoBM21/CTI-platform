import { PatternType } from '../../../../../../src/contexts/threat/domain/value-objects/pattern-type.vo';

describe('PatternType', () => {
    const values = Object.values(PatternType);

    it('should have exactly 6 values', () => {
        expect(values).toHaveLength(6);
    });

    it('should have all expected values from STIX pattern-type-ov', () => {
        expect(PatternType.STIX).toBe('stix');
        expect(PatternType.PCRE).toBe('pcre');
        expect(PatternType.SIGMA).toBe('sigma');
        expect(PatternType.SNORT).toBe('snort');
        expect(PatternType.SURICATA).toBe('suricata');
        expect(PatternType.YARA).toBe('yara');
    });

    it('should have all values as lowercase strings', () => {
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
