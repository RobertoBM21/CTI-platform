'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useAuth } from '@/providers/auth-context';
import { usePageTitle } from '@/providers/page-title-context';
import { ThemeToggle } from '@/shared/components/theme-toggle';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Map URL path segment → display label */
const SECTION_LABELS: Record<string, string> = {
    incidents: 'Incidents',
    campaigns: 'Campaigns',
    'threat-actors': 'Threat Actors',
    reports: 'Reports',
    'threat-domain': 'Threat Domain',
};

export function AppHeader() {
    const pathname = usePathname();
    const { pageTitle } = usePageTitle();
    const { user } = useAuth();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

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
                <DropdownMenu>
                    <DropdownMenuTrigger className="border-foreground/10 bg-card text-foreground/70 hover:text-foreground flex size-9 cursor-pointer items-center justify-center rounded-full border shadow-sm transition-colors">
                        <User className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-auto min-w-40"
                    >
                        {user && (
                            <>
                                <div className="px-1.5 py-2 text-sm font-medium whitespace-nowrap">
                                    {user.name}
                                </div>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        <DropdownMenuItem
                            onClick={() => logout()}
                            disabled={isLoggingOut}
                            variant="destructive"
                            className="cursor-pointer gap-2"
                        >
                            <LogOut className="size-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
