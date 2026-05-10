'use client';

import { usePageTitle } from '@/providers/page-title-context';
import { ThemeToggle } from '@/shared/components/theme-toggle';
import { User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Map URL path segment → display label */
const SECTION_LABELS: Record<string, string> = {
    incidents: 'Incidents',
    dashboard: 'Dashboard',
    settings: 'Settings',
    analytics: 'Analytics',
};

export function AppHeader() {
    const pathname = usePathname();
    const { pageTitle } = usePageTitle();

    const segments = pathname.split('/').filter(Boolean);

    // Build ordered crumbs: Home > Section > [detail title]
    const crumbs: { label: string; href?: string }[] = [
        { label: 'Home', href: '/' },
    ];
    if (segments[0]) {
        const sectionLabel = SECTION_LABELS[segments[0]] ?? segments[0];
        crumbs.push({
            label: sectionLabel,
            href: segments[1] ? `/${segments[0]}` : undefined,
        });
    }
    if (segments[1] && pageTitle) {
        crumbs.push({ label: pageTitle });
    }

    return (
        <header className="bg-background/80 flex h-14 shrink-0 items-center justify-between border-b px-6 backdrop-blur-sm lg:px-10">
            <nav className="flex min-w-0 items-center gap-1.5 text-sm">
                {crumbs.map((crumb, i) => (
                    <span key={i} className="flex min-w-0 items-center gap-1.5">
                        {i > 0 && (
                            <span className="text-foreground/30 shrink-0">
                                /
                            </span>
                        )}
                        {crumb.href ? (
                            <Link
                                href={crumb.href}
                                className={`transition-colors ${
                                    i === 0
                                        ? 'text-foreground/50 hover:text-foreground'
                                        : 'text-foreground/70 hover:text-foreground font-medium'
                                }`}
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="text-foreground max-w-xs truncate font-medium">
                                {crumb.label}
                            </span>
                        )}
                    </span>
                ))}
            </nav>
            <div className="flex shrink-0 items-center gap-4">
                <ThemeToggle />
                <div className="border-foreground/10 bg-card text-foreground/70 flex size-9 items-center justify-center rounded-full border shadow-sm">
                    <User className="size-4" />
                </div>
            </div>
        </header>
    );
}
