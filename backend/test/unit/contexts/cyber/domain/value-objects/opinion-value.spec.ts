import { OpinionValue } from '../../../../../../src/contexts/cyber/domain/value-objects/opinion-value.vo';

describe('OpinionValue', () => {
    const values = Object.values(OpinionValue);

    it('should have exactly 5 values', () => {
        expect(values).toHaveLength(5);
    });

    it('should have all expected values from opinion enum', () => {
        expect(OpinionValue.STRONGLY_DISAGREE).toBe('strongly-disagree');
        expect(OpinionValue.DISAGREE).toBe('disagree');
        expect(OpinionValue.NEUTRAL).toBe('neutral');
        expect(OpinionValue.AGREE).toBe('agree');
        expect(OpinionValue.STRONGLY_AGREE).toBe('strongly-agree');
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
