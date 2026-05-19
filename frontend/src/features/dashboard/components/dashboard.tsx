'use client';

import { cn } from '@/lib/utils';
import { BarChart3, Globe } from 'lucide-react';
import { useState } from 'react';
import type { DashboardTab } from '../types';
import { OverviewTab } from './overview-tab';
import { ThreatDomainTab } from './threat-tab';

// ── Tab definitions ────────────────────────────────────────────────────

const TABS: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'threat-domain', label: 'Threat Domain', icon: BarChart3 },
];

// ── Dashboard ──────────────────────────────────────────────────────────

export function Dashboard() {
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

    return (
        <div className="space-y-6">
            {/* Page title */}
            <div>
                <h1 className="text-foreground text-2xl font-bold tracking-tight">
                    Intelligence Dashboard
                </h1>
                <p className="text-foreground/50 mt-1 text-sm">
                    Global threat landscape overview and domain explorer
                </p>
            </div>

            {/* Tab navigation */}
            <div className="border-b">
                <nav
                    className="-mb-px flex gap-1 overflow-x-auto"
                    aria-label="Dashboard tabs"
                >
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={cn(
                                'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                                activeTab === id
                                    ? 'border-primary text-primary'
                                    : 'text-foreground/50 hover:border-foreground/20 hover:text-foreground/80 border-transparent',
                            )}
                            aria-current={activeTab === id ? 'true' : undefined}
                        >
                            <Icon className="size-4" />
                            {label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'threat-domain' && <ThreatDomainTab />}
        </div>
    );
}
