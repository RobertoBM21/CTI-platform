'use client';

import {
    buildDomainPath,
    isDomainRoute,
    type DomainRoute,
} from '@/shared/lib/domain-navigation';
import { useSearchParams } from 'next/navigation';

interface DetailNavigationContext {
    backPath: string;
    fromDomain: DomainRoute | null;
    fromTab: string | null;
}

export function useDetailNavigationContext(
    defaultBackPath: string,
): DetailNavigationContext {
    const searchParams = useSearchParams();
    const fromDomainValue = searchParams.get('fromDomain');
    const fromTab = searchParams.get('fromTab');

    if (!isDomainRoute(fromDomainValue)) {
        return {
            backPath: defaultBackPath,
            fromDomain: null,
            fromTab: null,
        };
    }

    return {
        backPath: buildDomainPath(fromDomainValue, fromTab),
        fromDomain: fromDomainValue,
        fromTab,
    };
}
