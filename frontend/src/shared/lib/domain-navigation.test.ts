import { describe, expect, it } from 'vitest';
import {
    buildDomainContextQuery,
    buildDomainPath,
    isDomainRoute,
} from './domain-navigation';

describe('domain-navigation helpers', () => {
    it('identifies supported domain routes', () => {
        expect(isDomainRoute('cyber-domain')).toBe(true);
        expect(isDomainRoute('threat-domain')).toBe(true);
        expect(isDomainRoute('incidents')).toBe(false);
        expect(isDomainRoute(null)).toBe(false);
    });

    it('builds a domain path with an optional tab', () => {
        expect(buildDomainPath('cyber-domain')).toBe('/cyber-domain');
        expect(buildDomainPath('cyber-domain', 'malware')).toBe(
            '/cyber-domain?tab=malware',
        );
    });

    it('builds the domain context query used by detail links', () => {
        expect(buildDomainContextQuery('cyber-domain', 'tools')).toEqual({
            fromDomain: 'cyber-domain',
            fromTab: 'tools',
        });
    });
});
