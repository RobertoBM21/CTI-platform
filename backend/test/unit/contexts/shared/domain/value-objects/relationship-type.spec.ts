import { RelationshipType } from '../../../../../../src/contexts/shared/domain/value-objects/relationship-type.vo';

describe('RelationshipType', () => {
    const values = Object.values(RelationshipType);

    it('should have exactly 25 values', () => {
        expect(values).toHaveLength(25);
    });

    it('should have all expected values', () => {
        expect(RelationshipType.USES).toBe('uses');
        expect(RelationshipType.TARGETS).toBe('targets');
        expect(RelationshipType.INDICATES).toBe('indicates');
        expect(RelationshipType.ATTRIBUTED_TO).toBe('attributed-to');
        expect(RelationshipType.RELATED_TO).toBe('related-to');
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
            expect(value).toMatch(/^[a-z]+(-[a-z]+)*$/);
        }
    });
});
