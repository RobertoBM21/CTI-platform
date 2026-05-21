export const DOMAIN_ROUTES = ['threat-domain', 'cyber-domain'] as const;

export type DomainRoute = (typeof DOMAIN_ROUTES)[number];

export function isDomainRoute(
    value: string | null | undefined,
): value is DomainRoute {
    return Boolean(value && DOMAIN_ROUTES.includes(value as DomainRoute));
}

export function buildDomainPath(
    domain: DomainRoute,
    tab?: string | null,
): string {
    if (!tab) {
        return `/${domain}`;
    }

    const params = new URLSearchParams();
    params.set('tab', tab);
    return `/${domain}?${params.toString()}`;
}

export function buildDomainContextQuery(
    domain: DomainRoute,
    tab: string,
): Record<string, string> {
    return {
        fromDomain: domain,
        fromTab: tab,
    };
}
