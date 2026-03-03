import { IocType } from '../../../../../../src/contexts/threat/domain/value-objects/ioc-type.vo';

describe('IocType', () => {
    const values = Object.values(IocType);

    it('should have exactly 12 values', () => {
        expect(values).toHaveLength(12);
    });

    it('should have all expected IoC type values', () => {
        expect(IocType.IPV4).toBe('ipv4');
        expect(IocType.IPV6).toBe('ipv6');
        expect(IocType.DOMAIN).toBe('domain');
        expect(IocType.URL).toBe('url');
        expect(IocType.EMAIL).toBe('email');
        expect(IocType.HASH_MD5).toBe('hash-md5');
        expect(IocType.HASH_SHA1).toBe('hash-sha1');
        expect(IocType.HASH_SHA256).toBe('hash-sha256');
        expect(IocType.HOSTNAME).toBe('hostname');
        expect(IocType.CIDR).toBe('cidr');
        expect(IocType.FILENAME).toBe('filename');
        expect(IocType.OTHER).toBe('other');
    });

    it('should have all values as lowercase/kebab-case strings', () => {
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
