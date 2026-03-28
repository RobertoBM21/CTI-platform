import { Tool } from '../../../../../../src/contexts/cyber/domain/entities/tool.entity';
import { ToolType } from '../../../../../../src/contexts/cyber/domain/value-objects/tool-type.vo';
import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';

describe('Tool', () => {
    describe('constructor with minimal props', () => {
        it('should create a Tool with only the name', () => {
            const tool = new Tool({ name: 'Mimikatz' });
            expect(tool.name).toBe('Mimikatz');
        });

        it('should generate an id when not provided', () => {
            const tool = new Tool({ name: 'Test' });
            expect(tool.id).toBeDefined();
            expect(typeof tool.id).toBe('string');
        });

        it('should default TLP to WHITE', () => {
            const tool = new Tool({ name: 'Test' });
            expect(tool.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const tool = new Tool({ name: 'Test' });
            expect(tool.toolTypes).toEqual([]);
            expect(tool.killChainPhases).toEqual([]);
            expect(tool.aliases).toEqual([]);
            expect(tool.externalReferences).toEqual([]);
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();

            const tool = new Tool({
                id: 'tool-id-1',
                name: 'Mimikatz',
                description: 'Credential dumping tool',
                toolTypes: [ToolType.CREDENTIAL_EXPLOITATION],
                killChainPhases: [
                    {
                        killChainName: 'mitre-attack',
                        phaseName: 'credential-access',
                    },
                ],
                toolVersion: '2.2.0',
                aliases: ['sekurlsa'],
                confidence: 90,
                revoked: false,
                externalReferences: [
                    { sourceName: 'MITRE', externalId: 'S0002' },
                ],
                tlp: TLP.AMBER,
                createdAt: now,
                updatedAt: now,
            });

            expect(tool.id).toBe('tool-id-1');
            expect(tool.name).toBe('Mimikatz');
            expect(tool.description).toBe('Credential dumping tool');
            expect(tool.toolTypes).toEqual([ToolType.CREDENTIAL_EXPLOITATION]);
            expect(tool.killChainPhases).toEqual([
                {
                    killChainName: 'mitre-attack',
                    phaseName: 'credential-access',
                },
            ]);
            expect(tool.toolVersion).toBe('2.2.0');
            expect(tool.aliases).toEqual(['sekurlsa']);
            expect(tool.confidence).toBe(90);
            expect(tool.revoked).toBe(false);
            expect(tool.externalReferences).toEqual([
                { sourceName: 'MITRE', externalId: 'S0002' },
            ]);
            expect(tool.tlp).toBe(TLP.AMBER);
            expect(tool.createdAt).toBe(now);
            expect(tool.updatedAt).toBe(now);
        });
    });

    describe('STIX common properties', () => {
        it('should default confidence to undefined', () => {
            const tool = new Tool({ name: 'Test' });
            expect(tool.confidence).toBeUndefined();
        });

        it('should default revoked to false', () => {
            const tool = new Tool({ name: 'Test' });
            expect(tool.revoked).toBe(false);
        });
    });
});
