import { Region } from '../../../../../../src/contexts/cyber/domain/value-objects/region.vo';

describe('Region', () => {
    const values = Object.values(Region);

    it('should have exactly 27 values', () => {
        expect(values).toHaveLength(27);
    });

    it('should include top-level regions', () => {
        expect(Region.AFRICA).toBe('africa');
        expect(Region.AMERICAS).toBe('americas');
        expect(Region.ASIA).toBe('asia');
        expect(Region.EUROPE).toBe('europe');
        expect(Region.OCEANIA).toBe('oceania');
        expect(Region.ANTARCTICA).toBe('antarctica');
    });

    it('should include sub-regions', () => {
        expect(Region.EASTERN_AFRICA).toBe('eastern-africa');
        expect(Region.NORTHERN_AMERICA).toBe('northern-america');
        expect(Region.SOUTH_EASTERN_ASIA).toBe('south-eastern-asia');
        expect(Region.WESTERN_EUROPE).toBe('western-europe');
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
