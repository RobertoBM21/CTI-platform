import { ThreatActorSophistication } from '../../../../../../src/contexts/threat/domain/value-objects/threat-actor-sophistication.vo';

describe('ThreatActorSophistication', () => {
    const values = Object.values(ThreatActorSophistication);

    it('should have exactly 7 values', () => {
        expect(values).toHaveLength(7);
    });

    it('should have all expected values in escalation order', () => {
        expect(ThreatActorSophistication.NONE).toBe('none');
        expect(ThreatActorSophistication.MINIMAL).toBe('minimal');
        expect(ThreatActorSophistication.INTERMEDIATE).toBe('intermediate');
        expect(ThreatActorSophistication.ADVANCED).toBe('advanced');
        expect(ThreatActorSophistication.EXPERT).toBe('expert');
        expect(ThreatActorSophistication.INNOVATOR).toBe('innovator');
        expect(ThreatActorSophistication.STRATEGIC).toBe('strategic');
    });

    it('should maintain escalation order from none to strategic', () => {
        const expectedOrder = [
            'none',
            'minimal',
            'intermediate',
            'advanced',
            'expert',
            'innovator',
            'strategic',
        ];
        expect(values).toEqual(expectedOrder);
    });

    it('should have all unique kebab-case string values', () => {
        const unique = new Set(values);
        expect(unique.size).toBe(values.length);
        for (const value of values) {
            expect(typeof value).toBe('string');
            expect(value).toMatch(/^[a-z][a-z0-9-]*$/);
        }
    });
});
