import { ToolType } from '../../../../../../src/contexts/cyber/domain/value-objects/tool-type.vo';

describe('ToolType', () => {
    const values = Object.values(ToolType);

    it('should have exactly 8 values', () => {
        expect(values).toHaveLength(8);
    });

    it('should have all expected values from tool-type-ov', () => {
        expect(ToolType.DENIAL_OF_SERVICE).toBe('denial-of-service');
        expect(ToolType.EXPLOITATION).toBe('exploitation');
        expect(ToolType.INFORMATION_GATHERING).toBe('information-gathering');
        expect(ToolType.NETWORK_CAPTURE).toBe('network-capture');
        expect(ToolType.CREDENTIAL_EXPLOITATION).toBe(
            'credential-exploitation',
        );
        expect(ToolType.REMOTE_ACCESS).toBe('remote-access');
        expect(ToolType.VULNERABILITY_SCANNING).toBe('vulnerability-scanning');
        expect(ToolType.UNKNOWN).toBe('unknown');
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
