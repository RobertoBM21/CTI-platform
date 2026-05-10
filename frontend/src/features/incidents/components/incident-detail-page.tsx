'use client';

import { usePageTitle } from '@/providers/page-title-context';
import { DetailPageHeader } from '@/shared/components/detail-page-header';
import { EntityInfoCard } from '@/shared/components/entity-info-card';
import {
    DetailErrorState,
    DetailLoadingState,
} from '@/shared/components/error-state';
import { ArtifactsTab } from '@/shared/components/tabs/artifacts-tab';
import { MapTab } from '@/shared/components/tabs/map-tab';
import { NetworkGraphTab } from '@/shared/components/tabs/network-graph-tab';
import { TimelineTab } from '@/shared/components/tabs/timeline-tab';
import { TLP } from '@/shared/types/enums';
import { Activity, Clock, FileText, Link2, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useIncidentDetail } from '../hooks/use-incident-detail';
import { getStixType } from '../utils';
import { ExecutiveSummaryTab } from './tabs/executive-summary-tab';

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
        return <DetailLoadingState message="Loading incident…" />;
    }

    if (isError || !data) {
        return (
            <DetailErrorState
                message="Failed to load the requested incident."
                backPath="/incidents"
                backLabel="Back to catalog"
            />
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
            <DetailPageHeader
                entityTypeLabel="INCIDENT"
                backPath="/incidents"
                name={entity.name}
                tlp={entity.tlp as TLP}
                confidence={entity.confidence}
            />

            {/* ── Page content ─────────────────────────────────── */}
            <div className="flex-1 space-y-6 px-6 py-6 lg:px-10">
                {/* ── Info card ─────────────────────────────────── */}
                <EntityInfoCard
                    name={entity.name}
                    description={entity.description}
                    confidence={entity.confidence}
                    createdAt={entity.createdAt}
                    updatedAt={entity.updatedAt}
                    primaryRef={primaryRef}
                    tags={tags}
                />

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
