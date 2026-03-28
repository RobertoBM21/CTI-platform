import { IntrusionSet } from '../../../../../../src/contexts/cyber/domain/entities/intrusion-set.entity';
import { AttackMotivation } from '../../../../../../src/contexts/shared/domain/value-objects/attack-motivation.vo';
import { ResourceLevel } from '../../../../../../src/contexts/shared/domain/value-objects/resource-level.vo';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('IntrusionSet', () => {
    describe('constructor with minimal props', () => {
        it('should create an IntrusionSet with only the name', () => {
            const is = new IntrusionSet({ name: 'APT28' });
            expect(is.name).toBe('APT28');
        });

        it('should generate an id when not provided', () => {
            const is = new IntrusionSet({ name: 'Test' });
            expect(is.id).toMatch(/^intrusion-set--/);
        });

        it('should default TLP to WHITE', () => {
            const is = new IntrusionSet({ name: 'Test' });
            expect(is.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const is = new IntrusionSet({ name: 'Test' });
            expect(is.aliases).toEqual([]);
            expect(is.primaryMotivations).toEqual([]);
            expect(is.secondaryMotivations).toEqual([]);
            expect(is.externalReferences).toEqual([]);
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();

            const is = new IntrusionSet({
                id: 'intrusion-set--is-id-1',
                name: 'APT28',
                description: 'Russian military intelligence group',
                aliases: ['Fancy Bear', 'Sofacy'],
                firstSeen: now,
                lastSeen: now,
                goals: 'Espionage',
                resourceLevel: ResourceLevel.GOVERNMENT,
                primaryMotivations: [AttackMotivation.IDEOLOGY],
                secondaryMotivations: [AttackMotivation.DOMINANCE],
                confidence: 90,
                revoked: false,
                externalReferences: [
                    { sourceName: 'MITRE', externalId: 'G0007' },
                ],
                tlp: TLP.RED,
                createdAt: now,
                updatedAt: now,
            });

            expect(is.id).toBe('intrusion-set--is-id-1');
            expect(is.name).toBe('APT28');
            expect(is.description).toBe('Russian military intelligence group');
            expect(is.aliases).toEqual(['Fancy Bear', 'Sofacy']);
            expect(is.firstSeen).toBe(now);
            expect(is.lastSeen).toBe(now);
            expect(is.goals).toBe('Espionage');
            expect(is.resourceLevel).toBe(ResourceLevel.GOVERNMENT);
            expect(is.primaryMotivations).toEqual([AttackMotivation.IDEOLOGY]);
            expect(is.secondaryMotivations).toEqual([
                AttackMotivation.DOMINANCE,
            ]);
            expect(is.confidence).toBe(90);
            expect(is.revoked).toBe(false);
            expect(is.externalReferences).toEqual([
                { sourceName: 'MITRE', externalId: 'G0007' },
            ]);
            expect(is.tlp).toBe(TLP.RED);
            expect(is.createdAt).toBe(now);
            expect(is.updatedAt).toBe(now);
        });
    });

    describe('STIX common properties', () => {
        it('should default confidence to undefined', () => {
            const is = new IntrusionSet({ name: 'Test' });
            expect(is.confidence).toBeUndefined();
        });

        it('should default revoked to false', () => {
            const is = new IntrusionSet({ name: 'Test' });
            expect(is.revoked).toBe(false);
        });
    });
});
