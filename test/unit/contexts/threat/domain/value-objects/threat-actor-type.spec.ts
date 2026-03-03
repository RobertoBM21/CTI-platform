import { ThreatActorType } from '../../../../../../src/contexts/threat/domain/value-objects/threat-actor-type.vo';

describe('ThreatActorType', () => {
    const values = Object.values(ThreatActorType);

    it('should have exactly 12 values', () => {
        expect(values).toHaveLength(12);
    });

    it('should have key values matching the STIX threat-actor-type-ov vocabulary', () => {
        expect(ThreatActorType.ACTIVIST).toBe('activist');
        expect(ThreatActorType.COMPETITOR).toBe('competitor');
        expect(ThreatActorType.CRIME_SYNDICATE).toBe('crime-syndicate');
        expect(ThreatActorType.CRIMINAL).toBe('criminal');
        expect(ThreatActorType.HACKER).toBe('hacker');
        expect(ThreatActorType.INSIDER_ACCIDENTAL).toBe('insider-accidental');
        expect(ThreatActorType.INSIDER_DISGRUNTLED).toBe('insider-disgruntled');
        expect(ThreatActorType.NATION_STATE).toBe('nation-state');
        expect(ThreatActorType.SENSATIONALIST).toBe('sensationalist');
        expect(ThreatActorType.SPY).toBe('spy');
        expect(ThreatActorType.TERRORIST).toBe('terrorist');
        expect(ThreatActorType.UNKNOWN).toBe('unknown');
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
