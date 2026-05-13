import { KillChainPhase } from '../../../../../../src/contexts/shared/domain/value-objects/kill-chain-phase.vo';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';
import { AttackPattern } from '../../../../../../src/contexts/threat/domain/entities/attack-pattern.entity';

describe('AttackPattern', () => {
    describe('constructor with minimal props', () => {
        it('should create an AttackPattern with only the name', () => {
            const pattern = new AttackPattern({
                name: 'T100 - Fabricate Evidence',
            });
            expect(pattern.name).toBe('T100 - Fabricate Evidence');
        });

        it('should generate an id when not provided', () => {
            const pattern = new AttackPattern({ name: 'Test Pattern' });
            expect(pattern.id).toMatch(/^attack-pattern--/);
        });

        it('should default TLP to WHITE', () => {
            const pattern = new AttackPattern({ name: 'Test Pattern' });
            expect(pattern.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const pattern = new AttackPattern({ name: 'Test Pattern' });
            expect(pattern.aliases).toEqual([]);
            expect(pattern.externalReferences).toEqual([]);
        });

        it('should auto-generate createdAt and updatedAt as Date instances', () => {
            const pattern = new AttackPattern({ name: 'Test Pattern' });
            expect(pattern.createdAt).toBeInstanceOf(Date);
            expect(pattern.updatedAt).toBeInstanceOf(Date);
        });

        it('should leave optional fields as undefined when not provided', () => {
            const pattern = new AttackPattern({ name: 'Test Pattern' });
            expect(pattern.description).toBeUndefined();
            expect(pattern.externalReference).toBeUndefined();
            expect(pattern.killChainPhases).toEqual([]);
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();

            const pattern = new AttackPattern({
                id: 'attack-pattern--pattern-id-101',
                name: 'T0097.206 - Fabricate Evidence',
                description: 'Creating false evidence to support a narrative',
                aliases: ['Evidence Fabrication', 'Fake Proof'],
                externalReference: 'T0097.206',
                killChainPhases: [
                    { killChainName: 'DISARM', phaseName: 'TA16' },
                ],
                tlp: TLP.GREEN,
                confidence: 75,
                revoked: true,
                externalReferences: [
                    { sourceName: 'DISARM', externalId: 'T0097.206' },
                ],
                createdAt: now,
                updatedAt: now,
            });

            expect(pattern.id).toBe('attack-pattern--pattern-id-101');
            expect(pattern.name).toBe('T0097.206 - Fabricate Evidence');
            expect(pattern.description).toBe(
                'Creating false evidence to support a narrative',
            );
            expect(pattern.aliases).toEqual([
                'Evidence Fabrication',
                'Fake Proof',
            ]);
            expect(pattern.externalReference).toBe('T0097.206');
            expect(pattern.killChainPhases).toEqual<KillChainPhase[]>([
                { killChainName: 'DISARM', phaseName: 'TA16' },
            ]);
            expect(pattern.tlp).toBe(TLP.GREEN);
            expect(pattern.confidence).toBe(75);
            expect(pattern.revoked).toBe(true);
            expect(pattern.externalReferences).toEqual([
                { sourceName: 'DISARM', externalId: 'T0097.206' },
            ]);
            expect(pattern.createdAt).toBe(now);
            expect(pattern.updatedAt).toBe(now);
        });
    });

    describe('DISARM framework compatibility', () => {
        it('should accept DISARM technique ID as externalReference', () => {
            const pattern = new AttackPattern({
                name: 'T0097.206 - Create Fake Research',
                externalReference: 'T0097.206',
            });
            expect(pattern.externalReference).toBe('T0097.206');
        });

        it('should accept DISARM tactic ID as killChainPhase', () => {
            const pattern = new AttackPattern({
                name: 'Test Pattern',
                killChainPhases: [
                    { killChainName: 'DISARM', phaseName: 'TA16' },
                ],
            });
            expect(pattern.killChainPhases).toEqual<KillChainPhase[]>([
                { killChainName: 'DISARM', phaseName: 'TA16' },
            ]);
        });
    });

    describe('STIX common properties', () => {
        it('should default confidence to undefined', () => {
            const pattern = new AttackPattern({ name: 'Test Pattern' });
            expect(pattern.confidence).toBeUndefined();
        });

        it('should default revoked to false', () => {
            const pattern = new AttackPattern({ name: 'Test Pattern' });
            expect(pattern.revoked).toBe(false);
        });

        it('should default externalReferences to empty array', () => {
            const pattern = new AttackPattern({ name: 'Test Pattern' });
            expect(pattern.externalReferences).toEqual([]);
        });

        it('should accept STIX common props when provided', () => {
            const pattern = new AttackPattern({
                name: 'Test Pattern',
                confidence: 85,
                revoked: true,
                externalReferences: [
                    { sourceName: 'DISARM', externalId: 'T0097' },
                ],
            });
            expect(pattern.confidence).toBe(85);
            expect(pattern.revoked).toBe(true);
            expect(pattern.externalReferences).toEqual([
                { sourceName: 'DISARM', externalId: 'T0097' },
            ]);
        });
    });
});
