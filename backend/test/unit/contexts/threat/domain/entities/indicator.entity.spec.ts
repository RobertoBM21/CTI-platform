import { TLP } from '../../../../../../src/contexts/shared/domain/value-objects/tlp.vo';
import { Indicator } from '../../../../../../src/contexts/threat/domain/entities/indicator.entity';
import { IndicatorType } from '../../../../../../src/contexts/threat/domain/value-objects/indicator-type.vo';
import { IocType } from '../../../../../../src/contexts/threat/domain/value-objects/ioc-type.vo';
import { PatternType } from '../../../../../../src/contexts/threat/domain/value-objects/pattern-type.vo';

describe('Indicator', () => {
    const minimalProps = {
        type: IocType.IPV4,
        value: '192.168.1.1',
    };

    describe('constructor with minimal props', () => {
        it('should create an Indicator with required fields', () => {
            const indicator = new Indicator(minimalProps);
            expect(indicator.type).toBe(IocType.IPV4);
            expect(indicator.value).toBe('192.168.1.1');
        });

        it('should generate an id when not provided', () => {
            const indicator = new Indicator(minimalProps);
            expect(indicator.id).toMatch(/^indicator--/);
        });

        it('should default TLP to WHITE', () => {
            const indicator = new Indicator(minimalProps);
            expect(indicator.tlp).toBe(TLP.WHITE);
        });

        it('should default arrays to empty', () => {
            const indicator = new Indicator(minimalProps);
            expect(indicator.tags).toEqual([]);
            expect(indicator.indicatorTypes).toEqual([]);
            expect(indicator.killChainPhases).toEqual([]);
            expect(indicator.externalReferences).toEqual([]);
        });

        it('should default revoked to false', () => {
            const indicator = new Indicator(minimalProps);
            expect(indicator.revoked).toBe(false);
        });

        it('should auto-generate createdAt and updatedAt as Date instances', () => {
            const indicator = new Indicator(minimalProps);
            expect(indicator.createdAt).toBeInstanceOf(Date);
            expect(indicator.updatedAt).toBeInstanceOf(Date);
        });

        it('should leave optional fields as undefined when not provided', () => {
            const indicator = new Indicator(minimalProps);
            expect(indicator.name).toBeUndefined();
            expect(indicator.description).toBeUndefined();
            expect(indicator.pattern).toBeUndefined();
            expect(indicator.patternType).toBeUndefined();
            expect(indicator.patternVersion).toBeUndefined();
            expect(indicator.validFrom).toBeUndefined();
            expect(indicator.validUntil).toBeUndefined();
            expect(indicator.confidence).toBeUndefined();
        });
    });

    describe('constructor with full props', () => {
        it('should assign all provided fields correctly', () => {
            const now = new Date();
            const validFrom = new Date('2025-01-01');
            const validUntil = new Date('2025-12-31');

            const indicator = new Indicator({
                id: 'indicator--indicator-id-555',
                name: 'Malicious IP Indicator',
                type: IocType.HASH_SHA256,
                value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                description: 'Known malicious hash from influence toolkit',
                indicatorTypes: [
                    IndicatorType.MALICIOUS_ACTIVITY,
                    IndicatorType.ATTRIBUTION,
                ],
                pattern:
                    "[file:hashes.'SHA-256' = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855']",
                patternType: PatternType.STIX,
                patternVersion: '2.1',
                validFrom,
                validUntil,
                killChainPhases: [
                    {
                        killChainName: 'mitre-attack',
                        phaseName: 'initial-access',
                    },
                ],
                tags: ['malware', 'influence-op', 'apt29'],
                confidence: 85,
                revoked: true,
                externalReferences: [
                    {
                        sourceName: 'MITRE',
                        externalId: 'T1566',
                        url: 'https://attack.mitre.org/techniques/T1566',
                    },
                ],
                tlp: TLP.AMBER,
                createdAt: now,
                updatedAt: now,
            });

            expect(indicator.id).toBe('indicator--indicator-id-555');
            expect(indicator.name).toBe('Malicious IP Indicator');
            expect(indicator.type).toBe(IocType.HASH_SHA256);
            expect(indicator.value).toBe(
                'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            );
            expect(indicator.description).toBe(
                'Known malicious hash from influence toolkit',
            );
            expect(indicator.indicatorTypes).toEqual([
                IndicatorType.MALICIOUS_ACTIVITY,
                IndicatorType.ATTRIBUTION,
            ]);
            expect(indicator.pattern).toBe(
                "[file:hashes.'SHA-256' = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855']",
            );
            expect(indicator.patternType).toBe(PatternType.STIX);
            expect(indicator.patternVersion).toBe('2.1');
            expect(indicator.validFrom).toBe(validFrom);
            expect(indicator.validUntil).toBe(validUntil);
            expect(indicator.killChainPhases).toEqual([
                {
                    killChainName: 'mitre-attack',
                    phaseName: 'initial-access',
                },
            ]);
            expect(indicator.tags).toEqual([
                'malware',
                'influence-op',
                'apt29',
            ]);
            expect(indicator.confidence).toBe(85);
            expect(indicator.revoked).toBe(true);
            expect(indicator.externalReferences).toEqual([
                {
                    sourceName: 'MITRE',
                    externalId: 'T1566',
                    url: 'https://attack.mitre.org/techniques/T1566',
                },
            ]);
            expect(indicator.tlp).toBe(TLP.AMBER);
            expect(indicator.createdAt).toBe(now);
            expect(indicator.updatedAt).toBe(now);
        });
    });

    describe('observable types', () => {
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
                const indicator = new Indicator({ type, value });
                expect(indicator.type).toBe(type);
                expect(indicator.value).toBe(value);
            }
        });
    });

    describe('STIX common properties', () => {
        it('should default confidence to undefined', () => {
            const indicator = new Indicator(minimalProps);
            expect(indicator.confidence).toBeUndefined();
        });

        it('should default revoked to false', () => {
            const indicator = new Indicator(minimalProps);
            expect(indicator.revoked).toBe(false);
        });

        it('should default externalReferences to empty array', () => {
            const indicator = new Indicator(minimalProps);
            expect(indicator.externalReferences).toEqual([]);
        });

        it('should accept STIX common props when provided', () => {
            const indicator = new Indicator({
                ...minimalProps,
                confidence: 90,
                revoked: true,
                externalReferences: [
                    { sourceName: 'OSINT', externalId: 'IOC-001' },
                ],
            });
            expect(indicator.confidence).toBe(90);
            expect(indicator.revoked).toBe(true);
            expect(indicator.externalReferences).toEqual([
                { sourceName: 'OSINT', externalId: 'IOC-001' },
            ]);
        });
    });
});
