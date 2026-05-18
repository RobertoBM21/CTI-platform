import { ThreatDomainCatalog } from '@/features/threat-domain';
import { Suspense } from 'react';

export default function ThreatDomainPage() {
    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Suspense>
                <ThreatDomainCatalog />
            </Suspense>
        </main>
    );
}
