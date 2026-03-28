import { InfrastructureEntity } from '../../../../../../src/contexts/cyber/domain/entities/infrastructure-entity.entity';
import { InfrastructureType } from '../../../../../../src/contexts/cyber/domain/value-objects/infrastructure-type.vo';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('InfrastructureEntity', () => {
    describe('constructor with minimal props', () => {
        it('should create an InfrastructureEntity with only the name', () => {
            const infra = new InfrastructureEntity({ name: 'C2 Server' });
            expect(infra.name).toBe('C2 Server');
        });

        it('should generate an id when not provided', () => {
            const infra = new InfrastructureEntity({ name: 'Test' });
            expect(infra.id).toBeDefined();
            expect(typeof infra.id).toBe('string');
        });

        it('should default TLP to WHITE', () => {
            const infra = new InfrastructureEntity({ name: 'Test' });
            expect(infra.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const infra = new InfrastructureEntity({ name: 'Test' });
            expect(infra.infrastructureTypes).toEqual([]);
            expect(infra.killChainPhases).toEqual([]);
            expect(infra.aliases).toEqual([]);
            expect(infra.externalReferences).toEqual([]);
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();

            const infra = new InfrastructureEntity({
                id: 'infra-id-1',
                name: 'C2 Server',
                description: 'Command and control infrastructure',
                infrastructureTypes: [InfrastructureType.COMMAND_AND_CONTROL],
                killChainPhases: [
                    {
                        killChainName: 'mitre-attack',
                        phaseName: 'command-and-control',
                    },
                ],
                aliases: ['Primary C2'],
                firstSeen: now,
                lastSeen: now,
                confidence: 85,
                revoked: false,
                externalReferences: [
                    { sourceName: 'Internal', externalId: 'INFRA-001' },
                ],
                tlp: TLP.AMBER,
                createdAt: now,
                updatedAt: now,
            });

            expect(infra.id).toBe('infra-id-1');
            expect(infra.name).toBe('C2 Server');
            expect(infra.description).toBe(
                'Command and control infrastructure',
            );
            expect(infra.infrastructureTypes).toEqual([
                InfrastructureType.COMMAND_AND_CONTROL,
            ]);
            expect(infra.killChainPhases).toEqual([
                {
                    killChainName: 'mitre-attack',
                    phaseName: 'command-and-control',
                },
            ]);
            expect(infra.aliases).toEqual(['Primary C2']);
            expect(infra.firstSeen).toBe(now);
            expect(infra.lastSeen).toBe(now);
            expect(infra.confidence).toBe(85);
            expect(infra.revoked).toBe(false);
            expect(infra.externalReferences).toEqual([
                { sourceName: 'Internal', externalId: 'INFRA-001' },
            ]);
            expect(infra.tlp).toBe(TLP.AMBER);
            expect(infra.createdAt).toBe(now);
            expect(infra.updatedAt).toBe(now);
        });
    });

    describe('STIX common properties', () => {
        it('should default confidence to undefined', () => {
            const infra = new InfrastructureEntity({ name: 'Test' });
            expect(infra.confidence).toBeUndefined();
        });

        it('should default revoked to false', () => {
            const infra = new InfrastructureEntity({ name: 'Test' });
            expect(infra.revoked).toBe(false);
        });
    });
});
