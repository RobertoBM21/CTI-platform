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
            expect(pattern.id).toBeDefined();
            expect(typeof pattern.id).toBe('string');
            expect(pattern.id.length).toBeGreaterThan(0);
        });

        it('should default TLP to WHITE', () => {
            const pattern = new AttackPattern({ name: 'Test Pattern' });
            expect(pattern.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const pattern = new AttackPattern({ name: 'Test Pattern' });
            expect(pattern.aliases).toEqual([]);
            expect(pattern.subPatternIds).toEqual([]);
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
            expect(pattern.killChainPhase).toBeUndefined();
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();

            const pattern = new AttackPattern({
                id: 'pattern-id-101',
                name: 'T0097.206 - Fabricate Evidence',
                description: 'Creating false evidence to support a narrative',
                aliases: ['Evidence Fabrication', 'Fake Proof'],
                externalReference: 'T0097.206',
                killChainPhase: 'TA16',
                tlp: TLP.GREEN,
                subPatternIds: ['sub-1', 'sub-2'],
                createdAt: now,
                updatedAt: now,
            });

            expect(pattern.id).toBe('pattern-id-101');
            expect(pattern.name).toBe('T0097.206 - Fabricate Evidence');
            expect(pattern.description).toBe(
                'Creating false evidence to support a narrative',
            );
            expect(pattern.aliases).toEqual([
                'Evidence Fabrication',
                'Fake Proof',
            ]);
            expect(pattern.externalReference).toBe('T0097.206');
            expect(pattern.killChainPhase).toBe('TA16');
            expect(pattern.tlp).toBe(TLP.GREEN);
            expect(pattern.subPatternIds).toEqual(['sub-1', 'sub-2']);
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
                killChainPhase: 'TA16',
            });
            expect(pattern.killChainPhase).toBe('TA16');
        });
    });
});
