'use client';

import { cn } from '@/lib/utils';
import { IngestionPanel } from '@/shared/components/ingestion-panel';
import {
    DOMAIN_DETAIL_SEGMENTS,
    domainNavItems,
    generalNavItems,
    homeNavItems,
} from '@/shared/lib/app-navigation';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { useLocationSearch } from '../hooks/use-location-search';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'cti.sidebar.collapsed';

export function AppSidebar() {
    const pathname = usePathname();
    const search = useLocationSearch();
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;

        try {
            return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1';
        } catch {
            return false;
        }
    });
    const searchParams = new URLSearchParams(search);
    const fromDomain = searchParams.get('fromDomain');
    const segments = pathname.split('/').filter(Boolean);
    const isDomainOriginDetail =
        Boolean(fromDomain) &&
        segments.length >= 2 &&
        DOMAIN_DETAIL_SEGMENTS.includes(
            segments[0] as (typeof DOMAIN_DETAIL_SEGMENTS)[number],
        );

    useEffect(() => {
        try {
            localStorage.setItem(
                SIDEBAR_COLLAPSED_STORAGE_KEY,
                collapsed ? '1' : '0',
            );
        } catch {
            // Ignore storage failures (private mode, blocked storage, etc.)
        }
    }, [collapsed]);

    function SidebarLink({
        item,
        isActive,
    }: {
        item: {
            label: string;
            href: string;
            icon: ComponentType<{ className?: string }>;
        };
        isActive: boolean;
    }) {
        const Icon = item.icon;
        return (
            <Link
                href={item.href}
                className={cn(
                    'group flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all duration-200',
                    isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-sidebar-foreground/50 hover:bg-white/5 hover:text-white',
                    collapsed && 'justify-center',
                )}
            >
                <span
                    className={cn(
                        'relative shrink-0',
                        collapsed && 'flex size-8 items-center justify-center',
                    )}
                >
                    <Icon
                        className={cn(
                            'size-5',
                            isActive
                                ? 'text-primary'
                                : 'text-sidebar-foreground/50 group-hover:text-white',
                        )}
                    />
                    {collapsed && (
                        <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-4 -translate-y-1/2 rounded-xl bg-white px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-900 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                            {item.label}
                        </div>
                    )}
                </span>
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                    <span className="bg-primary ml-auto size-1.5 rounded-full" />
                )}
            </Link>
        );
    }

    return (
        <aside
            className={cn(
                'bg-sidebar text-sidebar-foreground flex h-screen flex-col justify-between transition-all duration-300',
                collapsed ? 'w-20' : 'w-64',
            )}
        >
            <div>
                {/* Logo area */}
                {collapsed ? (
                    <div className="flex items-center justify-center px-3 pt-5 pb-3">
                        <div className="group relative">
                            <button
                                onClick={() => setCollapsed(false)}
                                className="relative flex items-center justify-center"
                                aria-label="Expand sidebar"
                            >
                                <div className="bg-primary shadow-primary/20 text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold shadow-lg transition-opacity duration-200 group-hover:opacity-0">
                                    I
                                </div>
                                <div className="bg-primary shadow-primary/20 text-primary-foreground absolute inset-0 flex size-8 items-center justify-center rounded-lg text-sm opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                    <ChevronRight className="size-4" />
                                </div>
                            </button>
                            <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-4 -translate-y-1/2 rounded-xl bg-white px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-900 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                Expand sidebar
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-20 items-center justify-between px-4">
                        <Link
                            href="/"
                            className="flex min-w-0 items-center gap-3"
                        >
                            <div className="bg-primary shadow-primary/20 text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold shadow-lg">
                                I
                            </div>
                            <span className="text-sidebar-foreground truncate text-lg font-semibold tracking-wide">
                                CITIUM
                            </span>
                        </Link>
                        <button
                            onClick={() => setCollapsed(true)}
                            className="text-sidebar-foreground/40 hover:text-sidebar-foreground shrink-0 rounded-lg p-1.5 transition-colors hover:bg-white/10"
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                    </div>
                )}

                {/* Nav section */}
                <nav className="space-y-1 p-3">
                    {/* Home section */}
                    {!collapsed && (
                        <p className="mb-1 px-3 pb-1 text-[0.85rem] font-bold tracking-widest text-white/25 uppercase">
                            Home
                        </p>
                    )}
                    {homeNavItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <SidebarLink
                                key={item.href}
                                item={item}
                                isActive={isActive}
                            />
                        );
                    })}

                    <div className="my-2 border-t border-white/10" />

                    {!collapsed && (
                        <p className="mb-1 px-3 pb-1 text-[0.85rem] font-bold tracking-widest text-white/25 uppercase">
                            Details
                        </p>
                    )}
                    {generalNavItems.map((item) => {
                        const isActive =
                            !isDomainOriginDetail &&
                            pathname.startsWith(item.href);
                        return (
                            <SidebarLink
                                key={item.href}
                                item={item}
                                isActive={isActive}
                            />
                        );
                    })}

                    <div className="my-2 border-t border-white/10" />

                    {!collapsed && (
                        <p className="mb-1 px-3 pb-1 text-[0.85rem] font-bold tracking-widest text-white/25 uppercase">
                            Domains
                        </p>
                    )}
                    {domainNavItems.map((item) => {
                        const isActive = isDomainOriginDetail
                            ? item.href === `/${fromDomain}`
                            : pathname.startsWith(item.href);
                        return (
                            <SidebarLink
                                key={item.href}
                                item={item}
                                isActive={isActive}
                            />
                        );
                    })}
                </nav>
            </div>

            {/* Bottom section */}
            <div className="space-y-1 border-t border-white/10 p-3">
                <IngestionPanel
                    trigger={
                        <button
                            className={cn(
                                'group flex w-full items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all duration-200',
                                'text-sidebar-foreground/50 hover:bg-white/5 hover:text-white',
                                collapsed && 'justify-center',
                            )}
                            aria-label="Ingest STIX bundle"
                        >
                            <span
                                className={cn(
                                    'relative shrink-0',
                                    collapsed &&
                                        'flex size-8 items-center justify-center',
                                )}
                            >
                                <Upload className="text-sidebar-foreground/50 size-5 group-hover:text-white" />
                                {collapsed && (
                                    <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-4 -translate-y-1/2 rounded-xl bg-white px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-900 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                        Ingest Bundle
                                    </div>
                                )}
                            </span>
                            {!collapsed && <span>Ingest Bundle</span>}
                        </button>
                    }
                />
            </div>
        </aside>
    );
}
