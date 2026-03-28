import { Relationship } from '../../../../../../src/contexts/shared/domain/entities/relationship.entity';
import { RelationshipType } from '../../../../../../src/contexts/shared/domain/value-objects/relationship-type.vo';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('Relationship', () => {
    describe('constructor with minimal props', () => {
        it('should create a Relationship with required props', () => {
            const rel = new Relationship({
                relationshipType: RelationshipType.USES,
                sourceRef: 'threat-actor--silent-eco-collective',
                targetRef: 'attack-pattern--fabricate-evidence',
            });
            expect(rel.relationshipType).toBe(RelationshipType.USES);
            expect(rel.sourceRef).toBe('threat-actor--silent-eco-collective');
            expect(rel.targetRef).toBe('attack-pattern--fabricate-evidence');
        });

        it('should generate an id when not provided', () => {
            const rel = new Relationship({
                relationshipType: RelationshipType.TARGETS,
                sourceRef: 'campaign--operation-blackout',
                targetRef: 'identity--energy-sector',
            });
            expect(rel.id).toMatch(/^relationship--/);
        });

        it('should default TLP to WHITE', () => {
            const rel = new Relationship({
                relationshipType: RelationshipType.USES,
                sourceRef: 'threat-actor--silent-eco-collective',
                targetRef: 'attack-pattern--fabricate-evidence',
            });
            expect(rel.tlp).toBe(TLP.WHITE);
        });

        it('should auto-generate createdAt and updatedAt as Date instances', () => {
            const before = new Date();
            const rel = new Relationship({
                relationshipType: RelationshipType.USES,
                sourceRef: 'threat-actor--silent-eco-collective',
                targetRef: 'attack-pattern--fabricate-evidence',
            });
            const after = new Date();
            expect(rel.createdAt).toBeInstanceOf(Date);
            expect(rel.updatedAt).toBeInstanceOf(Date);
            expect(rel.createdAt.getTime()).toBeGreaterThanOrEqual(
                before.getTime(),
            );
            expect(rel.updatedAt.getTime()).toBeLessThanOrEqual(
                after.getTime(),
            );
        });

        it('should leave optional fields as undefined when not provided', () => {
            const rel = new Relationship({
                relationshipType: RelationshipType.USES,
                sourceRef: 'threat-actor--silent-eco-collective',
                targetRef: 'attack-pattern--fabricate-evidence',
            });
            expect(rel.description).toBeUndefined();
            expect(rel.startTime).toBeUndefined();
            expect(rel.stopTime).toBeUndefined();
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const id = 'relationship--relationship-id-001';
            const start = new Date('2025-01-15');
            const stop = new Date('2025-06-30');
            const now = new Date();
            const rel = new Relationship({
                id,
                relationshipType: RelationshipType.ATTRIBUTED_TO,
                description:
                    'Operation Blackout attributed to Silent Eco Collective',
                sourceRef: 'campaign--operation-blackout',
                targetRef: 'threat-actor--silent-eco-collective',
                startTime: start,
                stopTime: stop,
                tlp: TLP.RED,
                createdAt: now,
                updatedAt: now,
            });

            expect(rel.id).toBe(id);
            expect(rel.relationshipType).toBe(RelationshipType.ATTRIBUTED_TO);
            expect(rel.description).toBe(
                'Operation Blackout attributed to Silent Eco Collective',
            );
            expect(rel.sourceRef).toBe('campaign--operation-blackout');
            expect(rel.targetRef).toBe('threat-actor--silent-eco-collective');
            expect(rel.startTime).toBe(start);
            expect(rel.stopTime).toBe(stop);
            expect(rel.tlp).toBe(TLP.RED);
            expect(rel.createdAt).toBe(now);
            expect(rel.updatedAt).toBe(now);
        });
    });
});
