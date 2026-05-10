import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('TLP', () => {
    const values = Object.values(TLP);

    it('should have exactly 6 values', () => {
        expect(values).toHaveLength(6);
    });

    it('should have all expected values', () => {
        expect(TLP.WHITE).toBe('white');
        expect(TLP.CLEAR).toBe('clear');
        expect(TLP.GREEN).toBe('green');
        expect(TLP.AMBER).toBe('amber');
        expect(TLP.AMBER_STRICT).toBe('amber+strict');
        expect(TLP.RED).toBe('red');
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

    it('should use kebab-case or lowercase format for values', () => {
        for (const value of values) {
            expect(value).toMatch(/^[a-z][a-z0-9+-]*$/);
        }
    });
});
