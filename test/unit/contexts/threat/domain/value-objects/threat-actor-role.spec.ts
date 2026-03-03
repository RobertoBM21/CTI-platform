import { ThreatActorRole } from '../../../../../../src/contexts/threat/domain/value-objects/threat-actor-role.vo';

describe('ThreatActorRole', () => {
    const values = Object.values(ThreatActorRole);

    it('should have exactly 6 values', () => {
        expect(values).toHaveLength(6);
    });

    it('should have all expected values from threat-actor-role-info-ov', () => {
        expect(ThreatActorRole.TRIGGER).toBe('trigger');
        expect(ThreatActorRole.BOOSTER).toBe('booster');
        expect(ThreatActorRole.LEGITIMIZER).toBe('legitimizer');
        expect(ThreatActorRole.SPREADER).toBe('spreader');
        expect(ThreatActorRole.RE_LAUNCHER).toBe('re-launcher');
        expect(ThreatActorRole.CONDITIONER).toBe('conditioner');
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
