import { AttackMotivation } from '../../../../../../src/contexts/threat/domain/value-objects/attack-motivation.vo';

describe('AttackMotivation', () => {
    const values = Object.values(AttackMotivation);

    it('should have exactly 10 values', () => {
        expect(values).toHaveLength(10);
    });

    it('should have all expected values from attack-motivation-ov', () => {
        expect(AttackMotivation.ACCIDENTAL).toBe('accidental');
        expect(AttackMotivation.COERCION).toBe('coercion');
        expect(AttackMotivation.DOMINANCE).toBe('dominance');
        expect(AttackMotivation.IDEOLOGY).toBe('ideology');
        expect(AttackMotivation.NOTORIETY).toBe('notoriety');
        expect(AttackMotivation.ORGANIZATIONAL_GAIN).toBe(
            'organizational-gain',
        );
        expect(AttackMotivation.PERSONAL_GAIN).toBe('personal-gain');
        expect(AttackMotivation.PERSONAL_SATISFACTION).toBe(
            'personal-satisfaction',
        );
        expect(AttackMotivation.REVENGE).toBe('revenge');
        expect(AttackMotivation.UNPREDICTABLE).toBe('unpredictable');
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
