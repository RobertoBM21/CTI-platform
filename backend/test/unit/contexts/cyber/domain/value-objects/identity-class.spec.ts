import { IdentityClass } from '../../../../../../src/contexts/cyber/domain/value-objects/identity-class.vo';

describe('IdentityClass', () => {
    const values = Object.values(IdentityClass);

    it('should have exactly 6 values', () => {
        expect(values).toHaveLength(6);
    });

    it('should have all expected values from identity-class-ov', () => {
        expect(IdentityClass.INDIVIDUAL).toBe('individual');
        expect(IdentityClass.GROUP).toBe('group');
        expect(IdentityClass.SYSTEM).toBe('system');
        expect(IdentityClass.ORGANIZATION).toBe('organization');
        expect(IdentityClass.CLASS).toBe('class');
        expect(IdentityClass.UNKNOWN).toBe('unknown');
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
