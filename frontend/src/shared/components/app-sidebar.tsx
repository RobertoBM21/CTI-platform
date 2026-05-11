'use client';

import { cn } from '@/lib/utils';
import { entityConfig } from '@/shared/components/entity-type-badge';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    {
        label: 'Incidents',
        href: '/incidents',
        icon: entityConfig.incident.icon,
    },
    {
        label: 'Campaigns',
        href: '/campaigns',
        icon: entityConfig.campaign.icon,
    },
];

const bottomItems: NavItem[] = [
    { label: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

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
                    <div className="flex flex-col items-center gap-2 px-3 pt-5 pb-3">
                        <Link
                            href="/"
                            className="flex items-center justify-center"
                        >
                            <div className="bg-primary shadow-primary/20 text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold shadow-lg">
                                I
                            </div>
                        </Link>
                        <button
                            onClick={() => setCollapsed(false)}
                            className="text-sidebar-foreground/40 hover:text-sidebar-foreground rounded-lg p-1.5 transition-colors hover:bg-white/10"
                            aria-label="Expand sidebar"
                        >
                            <ChevronRight className="size-4" />
                        </button>
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
                    {!collapsed && (
                        <p className="mb-1 px-3 pb-1 text-[0.7rem] font-bold tracking-widest text-white/25 uppercase">
                            General
                        </p>
                    )}
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={collapsed ? item.label : undefined}
                                className={cn(
                                    'group flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-sidebar-foreground/50 hover:bg-white/5 hover:text-white',
                                    collapsed && 'justify-center',
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'size-5 shrink-0',
                                        isActive
                                            ? 'text-primary'
                                            : 'text-sidebar-foreground/50 group-hover:text-white',
                                    )}
                                />
                                {!collapsed && <span>{item.label}</span>}
                                {isActive && !collapsed && (
                                    <span className="bg-primary ml-auto size-1.5 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom section */}
            <div className="border-t border-white/10 p-3">
                {bottomItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={cn(
                                'group flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-sidebar-foreground/50 hover:bg-white/5 hover:text-white',
                                collapsed && 'justify-center',
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'size-5 shrink-0',
                                    isActive
                                        ? 'text-primary'
                                        : 'text-sidebar-foreground/50 group-hover:text-white',
                                )}
                            />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}
