import { AttackMotivation } from '../../../../../../src/contexts/shared/domain/value-objects/attack-motivation.vo';
import { ResourceLevel } from '../../../../../../src/contexts/shared/domain/value-objects/resource-level.vo';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';
import { ThreatActor } from '../../../../../../src/contexts/threat/domain/entities/threat-actor.entity';
import { ThreatActorRole } from '../../../../../../src/contexts/threat/domain/value-objects/threat-actor-role.vo';
import { ThreatActorSophistication } from '../../../../../../src/contexts/threat/domain/value-objects/threat-actor-sophistication.vo';
import { ThreatActorType } from '../../../../../../src/contexts/threat/domain/value-objects/threat-actor-type.vo';

describe('ThreatActor', () => {
    describe('constructor with minimal props', () => {
        it('should create a ThreatActor with only the name', () => {
            const actor = new ThreatActor({ name: 'Silent Eco Collective' });
            expect(actor.name).toBe('Silent Eco Collective');
        });

        it('should generate an id when not provided', () => {
            const actor = new ThreatActor({ name: 'Test Actor' });
            expect(actor.id).toMatch(/^threat-actor--/);
        });

        it('should default TLP to WHITE', () => {
            const actor = new ThreatActor({ name: 'Test Actor' });
            expect(actor.tlp).toBe(TLP.WHITE);
        });

        it('should default all arrays to empty', () => {
            const actor = new ThreatActor({ name: 'Test Actor' });
            expect(actor.threatActorTypes).toEqual([]);
            expect(actor.aliases).toEqual([]);
            expect(actor.roles).toEqual([]);
            expect(actor.primaryMotivations).toEqual([]);
            expect(actor.secondaryMotivations).toEqual([]);
            expect(actor.externalReferences).toEqual([]);
        });

        it('should auto-generate createdAt and updatedAt as Date instances', () => {
            const actor = new ThreatActor({ name: 'Test Actor' });
            expect(actor.createdAt).toBeInstanceOf(Date);
            expect(actor.updatedAt).toBeInstanceOf(Date);
        });

        it('should leave optional fields as undefined when not provided', () => {
            const actor = new ThreatActor({ name: 'Test Actor' });
            expect(actor.description).toBeUndefined();
            expect(actor.firstSeen).toBeUndefined();
            expect(actor.lastSeen).toBeUndefined();
            expect(actor.goals).toBeUndefined();
            expect(actor.sophistication).toBeUndefined();
            expect(actor.resourceLevel).toBeUndefined();
            expect(actor.personalMotivations).toBeUndefined();
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();
            const firstSeen = new Date('2024-01-01');
            const lastSeen = new Date('2025-06-15');

            const actor = new ThreatActor({
                id: 'threat-actor--custom-id-123',
                name: 'APT-29 Influence',
                description: 'A state-sponsored influence operation',
                threatActorTypes: [
                    ThreatActorType.NATION_STATE,
                    ThreatActorType.SPY,
                ],
                aliases: ['Cozy Bear', 'The Dukes'],
                firstSeen,
                lastSeen,
                roles: [ThreatActorRole.TRIGGER, ThreatActorRole.BOOSTER],
                goals: 'Destabilize public opinion',
                sophistication: ThreatActorSophistication.STRATEGIC,
                resourceLevel: ResourceLevel.GOVERNMENT,
                primaryMotivations: [AttackMotivation.IDEOLOGY],
                secondaryMotivations: [AttackMotivation.DOMINANCE],
                personalMotivations: 'Geopolitical leverage',
                tlp: TLP.AMBER,
                confidence: 80,
                revoked: true,
                externalReferences: [
                    { sourceName: 'MITRE', externalId: 'G0016' },
                ],
                createdAt: now,
                updatedAt: now,
            });

            expect(actor.id).toBe('threat-actor--custom-id-123');
            expect(actor.name).toBe('APT-29 Influence');
            expect(actor.description).toBe(
                'A state-sponsored influence operation',
            );
            expect(actor.threatActorTypes).toEqual([
                ThreatActorType.NATION_STATE,
                ThreatActorType.SPY,
            ]);
            expect(actor.aliases).toEqual(['Cozy Bear', 'The Dukes']);
            expect(actor.firstSeen).toBe(firstSeen);
            expect(actor.lastSeen).toBe(lastSeen);
            expect(actor.roles).toEqual([
                ThreatActorRole.TRIGGER,
                ThreatActorRole.BOOSTER,
            ]);
            expect(actor.goals).toBe('Destabilize public opinion');
            expect(actor.sophistication).toBe(
                ThreatActorSophistication.STRATEGIC,
            );
            expect(actor.resourceLevel).toBe(ResourceLevel.GOVERNMENT);
            expect(actor.primaryMotivations).toEqual([
                AttackMotivation.IDEOLOGY,
            ]);
            expect(actor.secondaryMotivations).toEqual([
                AttackMotivation.DOMINANCE,
            ]);
            expect(actor.personalMotivations).toBe('Geopolitical leverage');
            expect(actor.tlp).toBe(TLP.AMBER);
            expect(actor.confidence).toBe(80);
            expect(actor.revoked).toBe(true);
            expect(actor.externalReferences).toEqual([
                { sourceName: 'MITRE', externalId: 'G0016' },
            ]);
            expect(actor.createdAt).toBe(now);
            expect(actor.updatedAt).toBe(now);
        });
    });

    describe('STIX common properties', () => {
        it('should default confidence to undefined', () => {
            const actor = new ThreatActor({ name: 'Test Actor' });
            expect(actor.confidence).toBeUndefined();
        });

        it('should default revoked to false', () => {
            const actor = new ThreatActor({ name: 'Test Actor' });
            expect(actor.revoked).toBe(false);
        });

        it('should default externalReferences to empty array', () => {
            const actor = new ThreatActor({ name: 'Test Actor' });
            expect(actor.externalReferences).toEqual([]);
        });

        it('should accept STIX common props when provided', () => {
            const actor = new ThreatActor({
                name: 'Test Actor',
                confidence: 95,
                revoked: true,
                externalReferences: [
                    { sourceName: 'MITRE', externalId: 'G0016' },
                ],
            });
            expect(actor.confidence).toBe(95);
            expect(actor.revoked).toBe(true);
            expect(actor.externalReferences).toEqual([
                { sourceName: 'MITRE', externalId: 'G0016' },
            ]);
        });
    });
});
