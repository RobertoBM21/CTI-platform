import { ResourceLevel } from '../../../../../../src/contexts/threat/domain/value-objects/resource-level.vo';

describe('ResourceLevel', () => {
    const values = Object.values(ResourceLevel);

    it('should have exactly 6 values', () => {
        expect(values).toHaveLength(6);
    });

    it('should have all expected values from STIX resource-level-ov', () => {
        expect(ResourceLevel.INDIVIDUAL).toBe('individual');
        expect(ResourceLevel.CLUB).toBe('club');
        expect(ResourceLevel.CONTEST).toBe('contest');
        expect(ResourceLevel.TEAM).toBe('team');
        expect(ResourceLevel.ORGANIZATION).toBe('organization');
        expect(ResourceLevel.GOVERNMENT).toBe('government');
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
