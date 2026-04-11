'use client';

import { ThemeToggle } from '@/shared/components/theme-toggle';
import { User } from 'lucide-react';
import Link from 'next/link';

export function AppHeader() {
    return (
        <header className="flex h-20 shrink-0 items-center justify-between px-6 lg:px-12">
            <nav className="text-foreground/50 flex items-center text-sm font-medium">
                <Link
                    href="/incidents"
                    className="hover:text-primary cursor-pointer transition-colors"
                >
                    Incidents
                </Link>
            </nav>
            <div className="flex items-center gap-5">
                <ThemeToggle />
                <div className="border-foreground/10 bg-card text-foreground/70 flex size-9 items-center justify-center rounded-full border shadow-sm">
                    <User className="size-4" />
                </div>
            </div>
        </header>
    );
}
