import { Campaign } from '../../../../../../src/contexts/threat/domain/entities/campaign.entity';
import { AttackMotivation } from '../../../../../../src/contexts/threat/domain/value-objects/attack-motivation.vo';
import { TLP } from '../../../../../../src/contexts/threat/domain/value-objects/tlp.vo';

describe('Campaign', () => {
    describe('constructor with minimal props', () => {
        it('should create a Campaign with only the name', () => {
            const campaign = new Campaign({ name: 'Operation Blackout' });
            expect(campaign.name).toBe('Operation Blackout');
        });

        it('should generate an id when not provided', () => {
            const campaign = new Campaign({ name: 'Test Campaign' });
            expect(campaign.id).toBeDefined();
            expect(typeof campaign.id).toBe('string');
            expect(campaign.id.length).toBeGreaterThan(0);
        });

        it('should default TLP to WHITE', () => {
            const campaign = new Campaign({ name: 'Test Campaign' });
            expect(campaign.tlp).toBe(TLP.WHITE);
        });

        it('should default all arrays to empty', () => {
            const campaign = new Campaign({ name: 'Test Campaign' });
            expect(campaign.aliases).toEqual([]);
            expect(campaign.primaryMotivations).toEqual([]);
            expect(campaign.secondaryMotivations).toEqual([]);
            expect(campaign.threatActorIds).toEqual([]);
            expect(campaign.attackPatternIds).toEqual([]);
        });

        it('should auto-generate createdAt and updatedAt as Date instances', () => {
            const campaign = new Campaign({ name: 'Test Campaign' });
            expect(campaign.createdAt).toBeInstanceOf(Date);
            expect(campaign.updatedAt).toBeInstanceOf(Date);
        });

        it('should leave optional fields as undefined when not provided', () => {
            const campaign = new Campaign({ name: 'Test Campaign' });
            expect(campaign.description).toBeUndefined();
            expect(campaign.firstSeen).toBeUndefined();
            expect(campaign.lastSeen).toBeUndefined();
            expect(campaign.objective).toBeUndefined();
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();
            const firstSeen = new Date('2024-03-01');
            const lastSeen = new Date('2025-12-31');

            const campaign = new Campaign({
                id: 'campaign-id-456',
                name: 'Operation Blackout',
                description:
                    'A coordinated influence campaign targeting energy sector',
                aliases: ['DarkGrid', 'PowerDown'],
                firstSeen,
                lastSeen,
                objective: 'Undermine public trust in energy infrastructure',
                primaryMotivations: [AttackMotivation.IDEOLOGY],
                secondaryMotivations: [AttackMotivation.DOMINANCE],
                tlp: TLP.RED,
                threatActorIds: ['actor-1', 'actor-2'],
                attackPatternIds: ['pattern-1'],
                createdAt: now,
                updatedAt: now,
            });

            expect(campaign.id).toBe('campaign-id-456');
            expect(campaign.name).toBe('Operation Blackout');
            expect(campaign.description).toBe(
                'A coordinated influence campaign targeting energy sector',
            );
            expect(campaign.aliases).toEqual(['DarkGrid', 'PowerDown']);
            expect(campaign.firstSeen).toBe(firstSeen);
            expect(campaign.lastSeen).toBe(lastSeen);
            expect(campaign.objective).toBe(
                'Undermine public trust in energy infrastructure',
            );
            expect(campaign.primaryMotivations).toEqual([
                AttackMotivation.IDEOLOGY,
            ]);
            expect(campaign.secondaryMotivations).toEqual([
                AttackMotivation.DOMINANCE,
            ]);
            expect(campaign.tlp).toBe(TLP.RED);
            expect(campaign.threatActorIds).toEqual(['actor-1', 'actor-2']);
            expect(campaign.attackPatternIds).toEqual(['pattern-1']);
            expect(campaign.createdAt).toBe(now);
            expect(campaign.updatedAt).toBe(now);
        });
    });

    describe('relationships', () => {
        it('should default threatActorIds and attackPatternIds to empty arrays', () => {
            const campaign = new Campaign({ name: 'Test Campaign' });
            expect(campaign.threatActorIds).toEqual([]);
            expect(campaign.attackPatternIds).toEqual([]);
        });

        it('should accept provided relationship arrays', () => {
            const campaign = new Campaign({
                name: 'Test Campaign',
                threatActorIds: ['ta-1', 'ta-2'],
                attackPatternIds: ['ap-1'],
            });
            expect(campaign.threatActorIds).toEqual(['ta-1', 'ta-2']);
            expect(campaign.attackPatternIds).toEqual(['ap-1']);
        });
    });
});
