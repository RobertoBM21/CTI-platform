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
            expect(actor.id).toBeDefined();
            expect(typeof actor.id).toBe('string');
            expect(actor.id.length).toBeGreaterThan(0);
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
            expect(actor.attackPatternIds).toEqual([]);
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
                id: 'custom-id-123',
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
                attackPatternIds: ['pattern-1', 'pattern-2'],
                createdAt: now,
                updatedAt: now,
            });

            expect(actor.id).toBe('custom-id-123');
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
            expect(actor.attackPatternIds).toEqual(['pattern-1', 'pattern-2']);
            expect(actor.createdAt).toBe(now);
            expect(actor.updatedAt).toBe(now);
        });
    });

    describe('relationships', () => {
        it('should accept an array of attackPatternIds', () => {
            const actor = new ThreatActor({
                name: 'Test Actor',
                attackPatternIds: ['ap-1', 'ap-2', 'ap-3'],
            });
            expect(actor.attackPatternIds).toEqual(['ap-1', 'ap-2', 'ap-3']);
        });

        it('should default attackPatternIds to an empty array', () => {
            const actor = new ThreatActor({ name: 'Test Actor' });
            expect(actor.attackPatternIds).toEqual([]);
        });
    });
});
