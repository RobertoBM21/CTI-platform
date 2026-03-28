import { InfrastructureType } from '../../../../../../src/contexts/cyber/domain/value-objects/infrastructure-type.vo';

describe('InfrastructureType', () => {
    const values = Object.values(InfrastructureType);

    it('should have exactly 15 values', () => {
        expect(values).toHaveLength(15);
    });

    it('should have all expected values from infrastructure-type-ov', () => {
        expect(InfrastructureType.AMPLIFICATION).toBe('amplification');
        expect(InfrastructureType.ANONYMIZATION).toBe('anonymization');
        expect(InfrastructureType.BOTNET).toBe('botnet');
        expect(InfrastructureType.COMMAND_AND_CONTROL).toBe(
            'command-and-control',
        );
        expect(InfrastructureType.CONTROL_SYSTEM).toBe('control-system');
        expect(InfrastructureType.EXFILTRATION).toBe('exfiltration');
        expect(InfrastructureType.FIREWALL).toBe('firewall');
        expect(InfrastructureType.HOSTING_MALWARE).toBe('hosting-malware');
        expect(InfrastructureType.HOSTING_TARGET_LISTS).toBe(
            'hosting-target-lists',
        );
        expect(InfrastructureType.PHISHING).toBe('phishing');
        expect(InfrastructureType.RECONNAISSANCE).toBe('reconnaissance');
        expect(InfrastructureType.ROUTERS_SWITCHES).toBe('routers-switches');
        expect(InfrastructureType.STAGING).toBe('staging');
        expect(InfrastructureType.WORKSTATION).toBe('workstation');
        expect(InfrastructureType.UNKNOWN).toBe('unknown');
    });

    it('should have all values as kebab-case strings', () => {
        for (const value of values) {
            expect(typeof value).toBe('string');
            expect(value).toMatch(/^[a-z][a-z0-9-]*$/);
        }
    });

    it('should have all unique values', () => {
        const unique = new Set(values);
        expect(unique.size).toBe(values.length);
    });
});
