import { Dashboard } from '@/features/dashboard';
import { Suspense } from 'react';

export default function HomePage() {
    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Suspense>
                <Dashboard />
            </Suspense>
        </main>
    );
}
