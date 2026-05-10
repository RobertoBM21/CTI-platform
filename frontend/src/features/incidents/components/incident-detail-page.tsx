'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/providers/page-title-context';
import { ConfidenceBadge } from '@/shared/components/confidence-badge';
import { TlpBadge } from '@/shared/components/tlp-badge';
import { TLP } from '@/shared/types/enums';
import {
    Activity,
    ArrowLeft,
    Building2,
    CalendarDays,
    Clock,
    Download,
    FileText,
    Link2,
    MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useIncidentDetail } from '../hooks/use-incident-detail';
import { formatDate, getStixType } from '../utils';
import { ArtifactsTab } from './tabs/artifacts-tab';
import { ExecutiveSummaryTab } from './tabs/executive-summary-tab';
import { MapTab } from './tabs/map-tab';
import { NetworkGraphTab } from './tabs/network-graph-tab';
import { TimelineTab } from './tabs/timeline-tab';

const TABS = [
    { id: 'summary', label: 'Executive Summary', icon: FileText },
    { id: 'network', label: 'Network Analysis', icon: Activity },
    { id: 'artifacts', label: 'Artifacts & IOCs', icon: Link2 },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'timeline', label: 'Audit & Timeline', icon: Clock },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface IncidentDetailPageProps {
    id: string;
}

export function IncidentDetailPage({ id }: IncidentDetailPageProps) {
    const [activeTab, setActiveTab] = useState<TabId>('summary');
    const { data, isLoading, isError } = useIncidentDetail(id);
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        if (data?.entity?.name) {
            setPageTitle(data.entity.name);
        }
        return () => setPageTitle('');
    }, [data?.entity?.name, setPageTitle]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="border-primary size-10 animate-spin rounded-full border-2 border-t-transparent" />
                <p className="text-foreground/50 text-sm">Loading incident…</p>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-full text-2xl font-bold">
                    !
                </div>
                <p className="font-semibold">Incident not found</p>
                <p className="text-foreground/50 text-sm">
                    Failed to load the requested incident.
                </p>
                <Link href="/incidents">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 size-4" />
                        Back to catalog
                    </Button>
                </Link>
            </div>
        );
    }

    const { entity } = data;
    const primaryRef = entity.externalReferences[0];

    const attackPatterns = data.relatedObjects
        .filter(
            ({ object }) =>
                object && getStixType(object.id) === 'attack-pattern',
        )
        .map(({ object }) => object!);
    const campaigns = data.relatedObjects
        .filter(({ object }) => object && getStixType(object.id) === 'campaign')
        .map(({ object }) => object!);
    const tags = [...attackPatterns, ...campaigns];

    return (
        <div className="flex min-h-full flex-col">
            {/* ── Sticky action bar ───────────────────────────── */}
            <div className="bg-background/90 sticky top-0 z-10 border-b backdrop-blur-sm">
                <div className="flex items-center gap-3 px-6 py-3 lg:px-10">
                    {/* Left: back + meta + title */}
                    <Link
                        href="/incidents"
                        className="text-foreground/50 hover:text-foreground shrink-0 rounded-lg p-1 transition-colors"
                        aria-label="Back to incidents"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>

                    <div className="text-foreground/40 shrink-0 text-sm font-medium select-none">
                        INCIDENT
                    </div>

                    <span className="text-foreground/80 min-w-0 flex-1 truncate text-sm font-semibold">
                        {entity.name}
                    </span>

                    {/* Right: actions */}
                    <div className="flex shrink-0 items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-foreground/70 hover:text-foreground"
                        >
                            <Download className="size-4" />
                            <span className="ml-1.5 hidden sm:inline">
                                Export PDF
                            </span>
                        </Button>
                        <ConfidenceBadge
                            confidence={entity.confidence}
                            className="h-7 px-3 text-xs"
                        />
                        <TlpBadge
                            tlp={entity.tlp as TLP}
                            className="h-7 px-3 text-xs"
                        />
                    </div>
                </div>
            </div>

            {/* ── Page content ─────────────────────────────────── */}
            <div className="flex-1 space-y-6 px-6 py-6 lg:px-10">
                {/* ── Info card ─────────────────────────────────── */}
                <div className="bg-card rounded-2xl border p-6 shadow-sm lg:p-8">
                    <div className="flex gap-10">
                        {/* Left: badges + title + description + tags */}
                        <div className="min-w-0 flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <ConfidenceBadge
                                    confidence={entity.confidence}
                                />
                                {tags.length > 0 && (
                                    <span className="text-foreground/40 text-xs font-bold tracking-widest uppercase">
                                        {tags[0].name ?? 'INCIDENT'}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl leading-snug font-bold lg:text-3xl">
                                {entity.name}
                            </h1>

                            {entity.description && (
                                <blockquote className="border-primary/40 text-foreground/70 border-l-4 pl-5 text-sm leading-relaxed italic">
                                    {entity.description}
                                </blockquote>
                            )}

                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {tags.map((obj) => (
                                        <Badge
                                            key={obj.id}
                                            variant="outline"
                                            className="text-foreground/60 text-xs"
                                        >
                                            {obj.name ?? obj.id}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Lead Author + Creation Date */}
                        <aside className="hidden w-56 shrink-0 space-y-6 lg:block">
                            {primaryRef && (
                                <div>
                                    <p className="text-foreground/40 mb-3 text-[0.65rem] font-bold tracking-widest uppercase">
                                        Lead Author
                                    </p>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                                            {primaryRef.sourceName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold">
                                                {primaryRef.sourceName}
                                            </p>
                                            <div className="text-foreground/50 mt-0.5 flex items-center gap-1 text-sm">
                                                <Building2 className="size-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {primaryRef.sourceName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-foreground/40 mb-3 text-[0.65rem] font-bold tracking-widest uppercase">
                                    Creation Date
                                </p>
                                <div className="flex items-start gap-3">
                                    <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
                                        <CalendarDays className="text-foreground/50 size-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold">
                                            {formatDate(entity.createdAt)}
                                        </p>
                                        <p className="text-foreground/40 mt-0.5 text-sm">
                                            Last mod:{' '}
                                            {formatDate(entity.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* ── Tab navigation ──────────────────────────── */}
                <div className="border-b">
                    <nav
                        className="-mb-px flex gap-1 overflow-x-auto"
                        aria-label="Incident detail tabs"
                    >
                        {TABS.map(({ id: tabId, label, icon: Icon }) => (
                            <button
                                key={tabId}
                                onClick={() => setActiveTab(tabId)}
                                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === tabId
                                        ? 'border-primary text-primary'
                                        : 'text-foreground/50 hover:border-foreground/20 hover:text-foreground/80 border-transparent'
                                }`}
                                aria-current={
                                    activeTab === tabId ? 'true' : undefined
                                }
                            >
                                <Icon className="size-4" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ── Tab content ─────────────────────────────── */}
                <div className="pb-12">
                    {activeTab === 'summary' && (
                        <ExecutiveSummaryTab detail={data} />
                    )}
                    {activeTab === 'network' && (
                        <NetworkGraphTab detail={data} />
                    )}
                    {activeTab === 'artifacts' && (
                        <ArtifactsTab detail={data} />
                    )}
                    {activeTab === 'map' && <MapTab detail={data} />}
                    {activeTab === 'timeline' && <TimelineTab detail={data} />}
                </div>
            </div>
        </div>
    );
}
