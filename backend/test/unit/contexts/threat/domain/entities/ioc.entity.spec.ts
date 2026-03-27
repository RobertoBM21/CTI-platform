import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';
import { Ioc } from '../../../../../../src/contexts/threat/domain/entities/ioc.entity';
import { IocType } from '../../../../../../src/contexts/threat/domain/value-objects/ioc-type.vo';

describe('Ioc', () => {
    const minimalProps = {
        type: IocType.IPV4,
        value: '192.168.1.1',
        sourceType: 'incident' as const,
        sourceId: 'incident-123',
    };

    describe('constructor with minimal props', () => {
        it('should create an IoC with required fields', () => {
            const ioc = new Ioc(minimalProps);
            expect(ioc.type).toBe(IocType.IPV4);
            expect(ioc.value).toBe('192.168.1.1');
            expect(ioc.sourceType).toBe('incident');
            expect(ioc.sourceId).toBe('incident-123');
        });

        it('should generate an id when not provided', () => {
            const ioc = new Ioc(minimalProps);
            expect(ioc.id).toBeDefined();
            expect(typeof ioc.id).toBe('string');
            expect(ioc.id.length).toBeGreaterThan(0);
        });

        it('should default TLP to WHITE', () => {
            const ioc = new Ioc(minimalProps);
            expect(ioc.tlp).toBe(TLP.WHITE);
        });

        it('should default tags to an empty array', () => {
            const ioc = new Ioc(minimalProps);
            expect(ioc.tags).toEqual([]);
        });

        it('should auto-generate createdAt and updatedAt as Date instances', () => {
            const ioc = new Ioc(minimalProps);
            expect(ioc.createdAt).toBeInstanceOf(Date);
            expect(ioc.updatedAt).toBeInstanceOf(Date);
        });

        it('should leave description as undefined when not provided', () => {
            const ioc = new Ioc(minimalProps);
            expect(ioc.description).toBeUndefined();
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();

            const ioc = new Ioc({
                id: 'ioc-id-555',
                type: IocType.HASH_SHA256,
                value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                description: 'Known malicious hash from influence toolkit',
                tags: ['malware', 'influence-op', 'apt29'],
                tlp: TLP.AMBER,
                sourceType: 'campaign',
                sourceId: 'campaign-456',
                createdAt: now,
                updatedAt: now,
            });

            expect(ioc.id).toBe('ioc-id-555');
            expect(ioc.type).toBe(IocType.HASH_SHA256);
            expect(ioc.value).toBe(
                'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            );
            expect(ioc.description).toBe(
                'Known malicious hash from influence toolkit',
            );
            expect(ioc.tags).toEqual(['malware', 'influence-op', 'apt29']);
            expect(ioc.tlp).toBe(TLP.AMBER);
            expect(ioc.sourceType).toBe('campaign');
            expect(ioc.sourceId).toBe('campaign-456');
            expect(ioc.createdAt).toBe(now);
            expect(ioc.updatedAt).toBe(now);
        });
    });

    describe('sourceType discriminator', () => {
        it('should accept "threat-actor" as sourceType', () => {
            const ioc = new Ioc({
                ...minimalProps,
                sourceType: 'threat-actor',
                sourceId: 'actor-1',
            });
            expect(ioc.sourceType).toBe('threat-actor');
        });

        it('should accept "campaign" as sourceType', () => {
            const ioc = new Ioc({
                ...minimalProps,
                sourceType: 'campaign',
                sourceId: 'campaign-1',
            });
            expect(ioc.sourceType).toBe('campaign');
        });

        it('should accept "incident" as sourceType', () => {
            const ioc = new Ioc({
                ...minimalProps,
                sourceType: 'incident',
                sourceId: 'incident-1',
            });
            expect(ioc.sourceType).toBe('incident');
        });
    });

    describe('IoC types', () => {
        it('should accept various IoC types', () => {
            const types = [
                { type: IocType.IPV4, value: '10.0.0.1' },
                { type: IocType.IPV6, value: '::1' },
                { type: IocType.DOMAIN, value: 'malicious.example.com' },
                {
                    type: IocType.URL,
                    value: 'https://malicious.example.com/path',
                },
                { type: IocType.EMAIL, value: 'attacker@example.com' },
                {
                    type: IocType.HASH_MD5,
                    value: 'd41d8cd98f00b204e9800998ecf8427e',
                },
                { type: IocType.HOSTNAME, value: 'c2-server.local' },
                { type: IocType.CIDR, value: '192.168.0.0/16' },
                { type: IocType.FILENAME, value: 'payload.exe' },
                { type: IocType.OTHER, value: 'custom-indicator' },
            ];

            for (const { type, value } of types) {
                const ioc = new Ioc({ ...minimalProps, type, value });
                expect(ioc.type).toBe(type);
                expect(ioc.value).toBe(value);
            }
        });
    });
});
